"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Upload01Icon,
  CloudUploadIcon,
  Cancel01Icon,
  File01Icon,
  VideoReplayIcon,
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
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

interface UploadFilesDialogProps {
  trigger: ReactNode;
  /** Async callback — receives the picked files and persists them.
   *  May throw to surface a friendly error in the dialog footer. */
  onUpload?: (files: File[]) => Promise<void> | void;
}

export function UploadFilesDialog({ trigger, onUpload }: UploadFilesDialogProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setFiles([]);
    setDragging(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const pick = (list: FileList | null) => {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    pick(e.dataTransfer.files);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (files.length === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onUpload?.(files);
      reset();
      setOpen(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="
          flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-2xl
          flex-col gap-0 p-0
        "
      >
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <DialogHeader className="flex-row items-center gap-2 border-b border-border px-5 py-4">
            <div className="flex size-7 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
              <Icon
                icon={Upload01Icon}
                size={16}
                strokeWidth={1.5}
                className="size-[16px]"
              />
            </div>
            <DialogTitle
              className="font-display text-[16px] font-medium tracking-tight text-foreground"
              style={{ letterSpacing: "-0.015em" }}
            >
              Upload de Arquivos
            </DialogTitle>
            <DialogDescription className="sr-only">
              Envie imagens, vídeos ou documentos para esta pasta.
            </DialogDescription>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
            <label
              htmlFor="upload-files-input"
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={cn(
                "group flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center transition-colors duration-150",
                isDragging
                  ? "border-primary/60 bg-primary/5"
                  : "border-edis-line-2 bg-edis-ink-2/60 hover:border-primary/40 hover:bg-edis-ink-2"
              )}
            >
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-md border transition-colors",
                  isDragging
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-edis-line-2 bg-edis-ink-3 text-edis-text-2 group-hover:border-primary/20 group-hover:text-primary"
                )}
              >
                <Icon
                  icon={CloudUploadIcon}
                  size={20}
                  strokeWidth={1.5}
                  className="size-[20px]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[13.5px] font-medium text-foreground">
                  {isDragging
                    ? "Solte os arquivos aqui"
                    : "Arraste arquivos ou clique para selecionar"}
                </span>
                <span className="text-[11.5px] text-edis-text-4">
                  Imagens, vídeos (MP4, MOV, WEBM), PDF, DOCX, TXT · limite 3GB por arquivo
                </span>
              </div>
              <input
                ref={fileInputRef}
                id="upload-files-input"
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                className="sr-only"
                onChange={(e) => pick(e.target.files)}
              />
            </label>

            {files.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-edis-text-3">
                  {files.length === 1
                    ? "1 arquivo selecionado"
                    : `${files.length} arquivos selecionados`}
                </span>
                <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {files.map((f, i) => (
                    <FilePreview
                      key={`${f.name}-${f.size}-${i}`}
                      file={f}
                      onRemove={() =>
                        setFiles((prev) => prev.filter((_, idx) => idx !== i))
                      }
                    />
                  ))}
                </ul>
              </div>
            )}
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
                disabled={files.length === 0 || submitting}
                className="h-9 bg-primary text-[13px] font-medium text-primary-foreground hover:bg-[#33eb8c] disabled:opacity-50"
              >
                {submitting
                  ? "Enviando…"
                  : `Enviar ${files.length > 0 ? `${files.length} arquivo${files.length > 1 ? "s" : ""}` : "arquivos"}`}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FilePreview({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const kind = file.type.startsWith("image/")
    ? "image"
    : file.type.startsWith("video/")
    ? "video"
    : "other";

  useEffect(() => {
    if (kind === "image" || kind === "video") {
      const u = URL.createObjectURL(file);
      setUrl(u);
      return () => URL.revokeObjectURL(u);
    }
    setUrl(null);
  }, [file, kind]);

  return (
    <li className="flex flex-col gap-1.5">
      <div className="group/p relative aspect-square overflow-hidden rounded-md border border-edis-line-2 bg-edis-ink-3">
        {kind === "image" && url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={file.name} className="h-full w-full object-cover" />
        )}
        {kind === "video" && url && (
          <video
            src={url}
            className="h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
        )}
        {kind === "other" && (
          <div className="flex h-full w-full items-center justify-center text-edis-text-3">
            <Icon
              icon={File01Icon}
              size={22}
              strokeWidth={1.5}
              className="size-[22px]"
            />
          </div>
        )}
        {kind === "video" && (
          <div className="pointer-events-none absolute bottom-1 left-1 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white/90">
            <Icon
              icon={VideoReplayIcon}
              size={10}
              className="size-[10px]"
            />
            video
          </div>
        )}
        <button
          type="button"
          aria-label={`Remover ${file.name}`}
          onClick={onRemove}
          className="
            absolute right-1 top-1 flex size-5 items-center justify-center
            rounded bg-black/70 text-white opacity-0 transition-opacity
            group-hover/p:opacity-100 focus-visible:opacity-100 hover:bg-black/90
          "
        >
          <Icon
            icon={Cancel01Icon}
            size={11}
            strokeWidth={2}
            className="size-[11px]"
          />
        </button>
      </div>
      <div className="flex min-w-0 flex-col">
        <span
          className="truncate text-[11px] text-edis-text-2"
          title={file.name}
        >
          {file.name}
        </span>
        <span className="font-mono text-[10px] text-edis-text-4">
          {formatBytes(file.size)}
        </span>
      </div>
    </li>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
