"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  TimerIcon,
  Download01Icon,
  GlobalIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/icon";
import { EdisLogo } from "@/components/layout/edis-logo";
import { FileCard } from "@/components/shared/file-card";
import { FilePreviewDialog } from "@/components/shared/file-dialogs";
import { createClient } from "@/lib/supabase/client";
import {
  getShare,
  isExpired,
  formatRemaining,
  incrementDownload,
  type FolderShare,
} from "@/app/(dashboard)/drive/_shares";
import type {
  DriveFolder,
  DriveFile,
} from "@/app/(dashboard)/drive/_data";

const BUCKET = "drive-files";

type LoadState =
  | { kind: "loading" }
  | { kind: "not-found" }
  | { kind: "expired"; share: FolderShare }
  | { kind: "ok"; share: FolderShare; folder: DriveFolder; files: DriveFile[] };

type PageProps = {
  params: Promise<{ shareId: string }>;
};

export default function PublicSharePage({ params }: PageProps) {
  const { shareId } = use(params);

  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [, setTick] = useState(0);
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);

  // Resolve the share, folder, and files. Public RLS lets the anon key
  // see everything for an active share; for files we generate signed URLs
  // so the private bucket renders without leaking the storage path.
  useEffect(() => {
    if (!shareId) {
      setState({ kind: "not-found" });
      return;
    }

    let cancelled = false;
    (async () => {
      const share = await getShare(shareId);
      if (cancelled) return;
      if (!share) {
        setState({ kind: "not-found" });
        return;
      }
      if (isExpired(share)) {
        setState({ kind: "expired", share });
        return;
      }

      const supabase = createClient();
      const folderRes = await supabase
        .from("drive_folders")
        .select("id, name, month, year, description")
        .eq("id", share.folderId)
        .maybeSingle();

      if (cancelled) return;
      if (folderRes.error || !folderRes.data) {
        setState({ kind: "not-found" });
        return;
      }

      const folder: DriveFolder = {
        id: folderRes.data.id,
        name: folderRes.data.name,
        month: folderRes.data.month,
        year: folderRes.data.year,
        fileCount: 0,
        description: folderRes.data.description ?? undefined,
      };

      const filesRes = await supabase
        .from("drive_files")
        .select("id, name, size, kind, storage_path")
        .eq("folder_id", share.folderId)
        .order("created_at", { ascending: true });

      const rows = filesRes.data ?? [];
      const signedUrls = await Promise.all(
        rows.map(async (r) => {
          if (!r.storage_path) return "";
          const { data } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(r.storage_path, 60 * 60); // 1h
          return data?.signedUrl ?? "";
        })
      );

      const files: DriveFile[] = rows.map((r, i) => ({
        id: r.id,
        name: r.name,
        size: r.size ?? 0,
        kind: (r.kind ?? "other") as DriveFile["kind"],
        thumbnailUrl: signedUrls[i],
      }));

      if (cancelled) return;
      setState({ kind: "ok", share, folder, files });
    })();

    return () => {
      cancelled = true;
    };
  }, [shareId]);

  // Countdown tick once per second while the share is live with a finite expiry.
  useEffect(() => {
    if (state.kind !== "ok" || state.share.expiresAt === null) return;
    const id = window.setInterval(() => {
      setTick((t) => t + 1);
      if (isExpired(state.share)) {
        setState({ kind: "expired", share: state.share });
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [state]);

  if (state.kind === "loading") {
    return <Centered>Carregando…</Centered>;
  }

  if (state.kind === "not-found") {
    return (
      <Centered>
        <div className="flex flex-col items-center gap-3 text-center">
          <Icon
            icon={Cancel01Icon}
            size={32}
            strokeWidth={1.5}
            className="size-[32px] text-edis-text-3"
          />
          <span className="edis-tag">Link inválido</span>
          <p className="max-w-md text-[13.5px] text-edis-text-3">
            Este link não existe ou foi revogado. Peça pra quem compartilhou gerar
            um novo.
          </p>
        </div>
      </Centered>
    );
  }

  if (state.kind === "expired") {
    return (
      <Centered>
        <div className="flex flex-col items-center gap-3 text-center">
          <Icon
            icon={TimerIcon}
            size={32}
            strokeWidth={1.5}
            className="size-[32px] text-[#ff5470]"
          />
          <span className="edis-tag" style={{ color: "#ff5470" }}>
            Link expirado
          </span>
          <p className="max-w-md text-[13.5px] text-edis-text-3">
            Este link expirou em{" "}
            <span className="font-mono text-edis-text-2">
              {new Date(state.share.expiresAt!).toLocaleString("pt-BR")}
            </span>
            . Os arquivos não estão mais acessíveis.
          </p>
        </div>
      </Centered>
    );
  }

  const { share, folder, files } = state;
  const remaining = formatRemaining(share.expiresAt);
  const expiringSoon =
    share.expiresAt !== null && share.expiresAt - Date.now() < 60 * 60 * 1000;

  async function handleFileDownload(file: DriveFile) {
    if (!file.thumbnailUrl) return;
    await incrementDownload(share.shareId);
    window.open(file.thumbnailUrl, "_blank", "noopener,noreferrer");
    setTick((t) => t + 1);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link
            href="/"
            aria-label="EDIS"
            className="group/edis-logo flex items-center rounded-md px-1 py-0.5"
          >
            <EdisLogo variant="lockup" size={22} />
          </Link>

          <span className="mx-1 text-edis-text-4">·</span>

          <div className="flex items-center gap-1.5">
            <Icon
              icon={GlobalIcon}
              size={12}
              strokeWidth={1.75}
              className="size-[12px] text-edis-text-4"
            />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-edis-text-4">
              Link público
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Stat
              icon={TimerIcon}
              label="Expira em"
              value={remaining}
              highlight={expiringSoon}
            />
            <Stat
              icon={Download01Icon}
              label="Downloads"
              value={share.downloadCount.toString()}
            />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-1.5">
          <span className="edis-tag">{folder.name}</span>
          <h1
            className="font-display text-[28px] font-medium leading-[1.1] tracking-tight text-foreground"
            style={{ letterSpacing: "-0.025em" }}
          >
            {files.length}{" "}
            {files.length === 1 ? "arquivo disponível" : "arquivos disponíveis"}
          </h1>
          <p className="text-[13.5px] text-edis-text-3">
            {folder.month} {folder.year}
            <span className="mx-2 text-edis-text-4">·</span>
            Clique em qualquer arquivo pra baixar.
          </p>
        </div>

        {files.length === 0 ? (
          <div className="mt-10 flex min-h-[260px] flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-10 text-center">
            <span className="edis-tag">Sem arquivos</span>
            <p className="text-[13px] text-edis-text-3">
              A pasta compartilhada está vazia.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {files.map((f) => (
              <FileCard
                key={f.id}
                name={f.name}
                size={f.size}
                kind={f.kind}
                thumbnailUrl={f.thumbnailUrl}
                onDownload={() => handleFileDownload(f)}
                onPreview={() => setPreviewFile(f)}
              />
            ))}
          </div>
        )}
      </section>

      {previewFile && (
        <FilePreviewDialog
          open={true}
          onOpenChange={(o) => !o && setPreviewFile(null)}
          fileId={previewFile.id}
          name={previewFile.name}
          thumbnailUrl={previewFile.thumbnailUrl}
          kind={previewFile.kind}
          onDownload={() => handleFileDownload(previewFile)}
          author="Cliente"
        />
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      {children}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: typeof TimerIcon;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-edis-line-2 bg-edis-ink-2 px-2.5 py-1.5">
      <Icon
        icon={icon}
        size={12}
        strokeWidth={1.75}
        className="size-[12px] text-edis-text-4"
      />
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-edis-text-4">
        {label}
      </span>
      <span
        className="font-mono text-[11px] font-medium"
        style={{ color: highlight ? "#ff5470" : "var(--foreground)" }}
      >
        {value}
      </span>
    </div>
  );
}
