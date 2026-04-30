"use client";

import { useCallback, useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft02Icon,
  Delete02Icon,
  PencilEdit01Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { UploadFilesDialog } from "@/components/shared/upload-files-dialog";
import {
  DeleteFolderDialog,
  EditFolderDialog,
} from "@/components/shared/folder-dialogs";
import { createClient } from "@/lib/supabase/client";
import type { DriveFile, DriveFolder } from "../_data";
import { FilesGrid } from "./_grid";

const BUCKET = "drive-files";

type PageProps = {
  params: Promise<{ folderId: string }>;
};

export default function FolderDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { folderId } = use(params);

  const [folder, setFolder] = useState<DriveFolder | null>(null);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const refresh = useCallback(async () => {
    const supabase = createClient();

    const folderRes = await supabase
      .from("drive_folders")
      .select("id, name, month, year, description")
      .eq("id", folderId)
      .maybeSingle();

    if (folderRes.error || !folderRes.data) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setFolder({
      id: folderRes.data.id,
      name: folderRes.data.name,
      month: folderRes.data.month,
      year: folderRes.data.year,
      fileCount: 0,
      description: folderRes.data.description ?? undefined,
    });

    const filesRes = await supabase
      .from("drive_files")
      .select("id, name, size, kind, thumbnail_url, storage_path")
      .eq("folder_id", folderId)
      .order("created_at", { ascending: true });

    // Generate signed URLs for thumbnails so the private bucket renders.
    const rows = filesRes.data ?? [];
    const signedUrls = await Promise.all(
      rows.map(async (r) => {
        if (!r.storage_path) return r.thumbnail_url ?? "";
        const { data } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(r.storage_path, 60 * 60); // 1h
        return data?.signedUrl ?? "";
      })
    );

    setFiles(
      rows.map((r, i) => ({
        id: r.id,
        name: r.name,
        size: r.size ?? 0,
        kind: (r.kind ?? "other") as DriveFile["kind"],
        thumbnailUrl: signedUrls[i],
      }))
    );
    setLoading(false);
  }, [folderId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleUpload(uploaded: File[]) {
    if (!folder) return;
    const supabase = createClient();
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) throw new Error("Faça login para fazer upload.");
    const userId = userRes.user.id;

    for (const file of uploaded) {
      const safeName = file.name.replace(/[^\w.\-]/g, "_");
      const objectPath = `${userId}/${folder.id}/${crypto.randomUUID()}-${safeName}`;

      const upload = await supabase.storage
        .from(BUCKET)
        .upload(objectPath, file, { contentType: file.type, upsert: false });
      if (upload.error) throw new Error(upload.error.message);

      const kind: DriveFile["kind"] = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
          ? "video"
          : "other";

      const insert = await supabase.from("drive_files").insert({
        user_id: userId,
        folder_id: folder.id,
        name: file.name,
        size: file.size,
        kind,
        storage_path: objectPath,
      });
      if (insert.error) throw new Error(insert.error.message);
    }

    await refresh();
  }

  async function handleRenameFile(id: string, newName: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("drive_files")
      .update({ name: newName })
      .eq("id", id);
    if (error) throw new Error(error.message);
    await refresh();
  }

  async function handleDeleteFile(id: string) {
    const supabase = createClient();
    const target = files.find((f) => f.id === id);
    // Lookup storage_path to remove the actual object too.
    const { data } = await supabase
      .from("drive_files")
      .select("storage_path")
      .eq("id", id)
      .maybeSingle();
    if (data?.storage_path) {
      await supabase.storage.from(BUCKET).remove([data.storage_path]);
    }
    const { error } = await supabase.from("drive_files").delete().eq("id", id);
    if (error) throw new Error(error.message);
    // Optimistic removal — if refresh fails the row is gone anyway.
    setFiles((prev) => prev.filter((f) => f.id !== target?.id));
    await refresh();
  }

  async function handleDownloadFile(file: DriveFile) {
    if (file.thumbnailUrl) {
      window.open(file.thumbnailUrl, "_blank", "noopener,noreferrer");
    }
  }

  async function handleEditFolderSave(updates: {
    name: string;
    month: string;
    year: number;
    description?: string;
  }) {
    if (!folder) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("drive_folders")
      .update({
        name: updates.name,
        month: updates.month,
        year: updates.year,
        description: updates.description ?? null,
      })
      .eq("id", folder.id);
    if (error) throw new Error(error.message);
    await refresh();
  }

  async function handleDeleteFolder() {
    if (!folder) return;
    const supabase = createClient();
    // Drop every storage object for this folder before deleting the row.
    const { data: rows } = await supabase
      .from("drive_files")
      .select("storage_path")
      .eq("folder_id", folder.id);
    const paths = (rows ?? [])
      .map((r) => r.storage_path)
      .filter((p): p is string => Boolean(p));
    if (paths.length > 0) {
      await supabase.storage.from(BUCKET).remove(paths);
    }
    const { error } = await supabase
      .from("drive_folders")
      .delete()
      .eq("id", folder.id);
    if (error) throw new Error(error.message);
    router.push("/drive");
  }

  if (notFound) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 py-20 text-center">
        <span className="edis-tag">Pasta não encontrada</span>
        <p className="text-[14px] text-edis-text-3">
          A pasta solicitada não existe ou foi removida.
        </p>
        <Link
          href="/drive"
          className="text-[13px] font-medium text-primary underline-offset-4 hover:underline"
        >
          Voltar pro Drive
        </Link>
      </div>
    );
  }

  if (loading || !folder) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="h-8 w-48 animate-pulse rounded-md bg-edis-ink-2" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] animate-pulse rounded-xl bg-edis-ink-2"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/drive"
            aria-label="Voltar para Drive"
            className="
              mt-1 flex size-8 shrink-0 items-center justify-center rounded-md
              border border-edis-line-2 bg-edis-ink-2 text-edis-text-2
              transition-colors duration-150
              hover:border-edis-line-3 hover:bg-edis-ink-3 hover:text-foreground
            "
          >
            <Icon
              icon={ArrowLeft02Icon}
              size={16}
              strokeWidth={1.75}
              className="size-[16px]"
            />
          </Link>
          <div className="flex flex-col gap-1">
            <h1
              className="font-display text-[26px] font-medium leading-[1.15] tracking-tight text-foreground"
              style={{ letterSpacing: "-0.025em" }}
            >
              {folder.name}
            </h1>
            <p className="text-[13px] text-edis-text-3">
              {folder.month} {folder.year}
              <span className="mx-2 text-edis-text-4">·</span>
              <span className="font-mono text-[11.5px] text-edis-text-4">
                {files.length} {files.length === 1 ? "arquivo" : "arquivos"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="h-9 gap-2 rounded-md border-edis-line-2 bg-edis-ink-2 px-3 text-[13px] text-edis-text-2 hover:bg-edis-ink-3 hover:text-foreground"
          >
            <Icon icon={PencilEdit01Icon} size={14} />
            Editar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="h-9 gap-2 rounded-md border-[#ff5470]/30 bg-[#ff5470]/10 px-3 text-[13px] text-[#ff5470] hover:border-[#ff5470]/50 hover:bg-[#ff5470]/20"
          >
            <Icon icon={Delete02Icon} size={14} />
            Excluir
          </Button>
          <UploadFilesDialog
            onUpload={handleUpload}
            trigger={
              <Button
                size="sm"
                className="h-9 gap-2 rounded-md bg-primary px-3.5 text-[13px] font-medium text-primary-foreground hover:bg-[#33eb8c]"
              >
                <Icon
                  icon={Upload01Icon}
                  size={16}
                  strokeWidth={2}
                  className="size-[16px]"
                />
                Upload de Arquivos
              </Button>
            }
          />
        </div>
      </header>

      <FilesGrid
        files={files}
        onRename={handleRenameFile}
        onDelete={handleDeleteFile}
        onDownload={handleDownloadFile}
      />

      <EditFolderDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        folder={folder}
        onSave={handleEditFolderSave}
      />
      <DeleteFolderDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        name={folder.name}
        fileCount={files.length}
        onConfirm={handleDeleteFolder}
      />
    </div>
  );
}
