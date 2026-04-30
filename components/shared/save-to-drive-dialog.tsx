"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Add01Icon,
  CloudUploadIcon,
  Folder01Icon,
} from "@hugeicons/core-free-icons";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@/components/icon";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const BUCKET = "drive-files";
const NEW_FOLDER_VALUE = "__new__";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const NOW = new Date();
const DEFAULT_MONTH = MONTHS[NOW.getMonth()];
const DEFAULT_YEAR = String(NOW.getFullYear());

type FolderRow = {
  id: string;
  name: string;
  month: string;
  year: number;
};

interface SaveToDriveDialogProps {
  trigger: ReactNode;
  /** The asset to save. Can be a data URL ("data:image/png;base64,...")
   *  or a regular URL — for data URLs we decode locally; otherwise we fetch. */
  imageUrl: string;
  /** Default file name shown in the input. User can edit. */
  defaultFileName: string;
  /** Optional callback fired once the save persists, e.g. to show a toast. */
  onSaved?: (folderId: string) => void;
}

export function SaveToDriveDialog({
  trigger,
  imageUrl,
  defaultFileName,
  onSaved,
}: SaveToDriveDialogProps) {
  const [open, setOpen] = useState(false);
  const [folders, setFolders] = useState<FolderRow[]>([]);
  const [folderId, setFolderId] = useState<string>("");
  const [fileName, setFileName] = useState(defaultFileName);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderMonth, setNewFolderMonth] = useState(DEFAULT_MONTH);
  const [newFolderYear, setNewFolderYear] = useState(DEFAULT_YEAR);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refresh the user's folder list each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("drive_folders")
        .select("id, name, month, year")
        .order("year", { ascending: false })
        .order("created_at", { ascending: false });
      if (cancelled) return;
      const rows = (data ?? []) as FolderRow[];
      setFolders(rows);
      // Default to the most recent folder, or "new" if there are none.
      setFolderId(rows[0]?.id ?? NEW_FOLDER_VALUE);
      setFileName(defaultFileName);
      setNewFolderName("");
      setNewFolderMonth(DEFAULT_MONTH);
      setNewFolderYear(DEFAULT_YEAR);
      setError(null);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, defaultFileName]);

  const creatingNew = folderId === NEW_FOLDER_VALUE;
  const trimmedName = fileName.trim();
  const trimmedFolderName = newFolderName.trim();
  const canSubmit =
    !submitting &&
    trimmedName.length > 0 &&
    (!creatingNew || trimmedFolderName.length > 0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) throw new Error("Faça login para salvar no Drive.");
      const userId = userRes.user.id;

      // Resolve the destination folder — either an existing row or a new one.
      let destFolderId = folderId;
      if (creatingNew) {
        const { data: created, error: insertErr } = await supabase
          .from("drive_folders")
          .insert({
            user_id: userId,
            name: trimmedFolderName,
            month: newFolderMonth,
            year: Number(newFolderYear),
          })
          .select("id")
          .single();
        if (insertErr) throw new Error(insertErr.message);
        destFolderId = created!.id;
      }

      // Convert the source image into a Blob for upload.
      const blob = await fetchAsBlob(imageUrl);
      const ext = guessExtensionFromMime(blob.type) ?? "png";
      const safeName = trimmedName.toLowerCase().endsWith(`.${ext}`)
        ? trimmedName
        : `${trimmedName}.${ext}`;
      const objectPath = `${userId}/${destFolderId}/${crypto.randomUUID()}-${safeName.replace(/[^\w.\-]/g, "_")}`;

      const upload = await supabase.storage
        .from(BUCKET)
        .upload(objectPath, blob, { contentType: blob.type, upsert: false });
      if (upload.error) throw new Error(upload.error.message);

      const insert = await supabase.from("drive_files").insert({
        user_id: userId,
        folder_id: destFolderId,
        name: safeName,
        size: blob.size,
        kind: blob.type.startsWith("image/")
          ? "image"
          : blob.type.startsWith("video/")
            ? "video"
            : "other",
        storage_path: objectPath,
      });
      if (insert.error) throw new Error(insert.error.message);

      onSaved?.(destFolderId);
      setOpen(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="
          flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-md
          flex-col gap-0 p-0
        "
      >
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <DialogHeader className="flex-row items-center gap-2 border-b border-border px-5 py-4">
            <div className="flex size-7 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
              <Icon icon={CloudUploadIcon} size={16} strokeWidth={1.5} />
            </div>
            <DialogTitle
              className="font-display text-[16px] font-medium tracking-tight text-foreground"
              style={{ letterSpacing: "-0.015em" }}
            >
              Salvar no Drive
            </DialogTitle>
            <DialogDescription className="sr-only">
              Salve o criativo gerado em uma pasta do Drive.
            </DialogDescription>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
            <FieldWrap label="Pasta" required>
              <Select value={folderId} onValueChange={setFolderId}>
                <SelectTrigger
                  data-size="default"
                  className="h-9 w-full border-edis-line-2 bg-edis-ink-2 text-[13px] text-foreground"
                >
                  <SelectValue placeholder="Selecionar pasta" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  <SelectItem value={NEW_FOLDER_VALUE} className="text-[13px]">
                    <span className="flex items-center gap-2">
                      <Icon icon={Add01Icon} size={12} className="text-primary" />
                      Criar nova pasta…
                    </span>
                  </SelectItem>
                  {folders.map((f) => (
                    <SelectItem key={f.id} value={f.id} className="text-[13px]">
                      <span className="flex items-center gap-2">
                        <Icon icon={Folder01Icon} size={12} className="text-primary" />
                        {f.name}
                        <span className="font-mono text-[10.5px] text-edis-text-4">
                          {f.month} {f.year}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldWrap>

            {creatingNew && (
              <div className="flex flex-col gap-3 rounded-md border border-dashed border-edis-line-2 bg-edis-ink-2/60 p-3">
                <FieldWrap label="Nome da nova pasta" required htmlFor="save-new-folder-name">
                  <Input
                    id="save-new-folder-name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Ex: Campanha Maio"
                    className="h-9 border-edis-line-2 bg-edis-ink-2 text-[13px]"
                  />
                </FieldWrap>
                <div className="grid grid-cols-2 gap-3">
                  <FieldWrap label="Mês" required>
                    <Select value={newFolderMonth} onValueChange={setNewFolderMonth}>
                      <SelectTrigger
                        data-size="default"
                        className="h-9 w-full border-edis-line-2 bg-edis-ink-2 text-[13px] text-foreground"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-popover">
                        {MONTHS.map((m) => (
                          <SelectItem key={m} value={m} className="text-[13px]">
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldWrap>
                  <FieldWrap label="Ano" required>
                    <Input
                      type="number"
                      value={newFolderYear}
                      onChange={(e) => setNewFolderYear(e.target.value)}
                      className="h-9 border-edis-line-2 bg-edis-ink-2 text-[13px]"
                    />
                  </FieldWrap>
                </div>
              </div>
            )}

            <FieldWrap label="Nome do arquivo" required htmlFor="save-file-name">
              <Input
                id="save-file-name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="edis-criativo.png"
                className="h-9 border-edis-line-2 bg-edis-ink-2 text-[13px]"
              />
            </FieldWrap>
          </div>

          <DialogFooter className="m-0 flex-row items-center justify-between gap-2 rounded-b-xl border-t border-border bg-card px-5 py-3 sm:justify-between">
            {error ? (
              <p className="text-[12px] text-red-400">{error}</p>
            ) : (
              <span />
            )}
            <div className="ml-auto flex items-center gap-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={submitting}
                  className="h-9 border-edis-line-2 bg-transparent text-[13px] text-edis-text-2 hover:bg-edis-ink-3 hover:text-foreground"
                >
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                size="sm"
                disabled={!canSubmit}
                className="h-9 bg-primary text-[13px] font-medium text-primary-foreground hover:bg-[#33eb8c] disabled:opacity-50"
              >
                {submitting ? "Salvando…" : "Salvar"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

async function fetchAsBlob(src: string): Promise<Blob> {
  const res = await fetch(src);
  return await res.blob();
}

function guessExtensionFromMime(mime: string): string | null {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return null;
}

function FieldWrap({
  label,
  required,
  htmlFor,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-edis-text-4"
      >
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </label>
      {children}
    </div>
  );
}
