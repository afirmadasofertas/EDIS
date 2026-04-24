"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  FolderAddIcon,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const YEARS = ["2024", "2025", "2026", "2027"];

interface NewFolderDialogProps {
  trigger: ReactNode;
}

export function NewFolderDialog({ trigger }: NewFolderDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [month, setMonth] = useState<string>("Abril");
  const [year, setYear] = useState<string>("2026");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = name.trim().length > 0 && !!month && !!year;

  function resetForm() {
    setName("");
    setMonth("Abril");
    setYear("2026");
    setDescription("");
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    // TODO: wire to backend.
    // eslint-disable-next-line no-console
    console.log("[new-folder]", { name, month, year, description, files });
    resetForm();
    setOpen(false);
  }

  function handleFilesPicked(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) resetForm();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="
          flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-2xl
          flex-col gap-0 p-0
          sm:max-w-2xl
        "
      >
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          {/* Header (sticky) */}
          <DialogHeader className="flex-row items-center gap-2 border-b border-border px-5 py-4">
            <div className="flex size-7 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
              <Icon icon={FolderAddIcon} size={16} strokeWidth={1.5} />
            </div>
            <DialogTitle
              className="font-display text-[16px] font-medium tracking-tight text-foreground"
              style={{ letterSpacing: "-0.015em" }}
            >
              Nova Pasta
            </DialogTitle>
            <DialogDescription className="sr-only">
              Crie uma pasta no Drive e opcionalmente envie arquivos iniciais.
            </DialogDescription>
          </DialogHeader>

          {/* Body (scrollable) */}
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-y-auto p-5 md:grid-cols-2">
            {/* Left column */}
            <div className="flex flex-col gap-4">
              {/* Nome da Oferta */}
              <FieldWrap label="Nome da oferta" required htmlFor="folder-name">
                <Input
                  id="folder-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Celular iPhone 15"
                  required
                  className="
                    h-9 border-edis-line-2 bg-edis-ink-2 text-[13px]
                    placeholder:text-edis-text-4
                    focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20
                  "
                />
              </FieldWrap>

              {/* Mês + Ano */}
              <div className="grid grid-cols-2 gap-3">
                <FieldWrap label="Mês" required>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger
                      data-size="default"
                      className="
                        h-9 w-full border-edis-line-2 bg-edis-ink-2 text-[13px]
                        text-foreground
                        focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20
                      "
                    >
                      <SelectValue placeholder="Selecionar" />
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
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger
                      data-size="default"
                      className="
                        h-9 w-full border-edis-line-2 bg-edis-ink-2 text-[13px]
                        text-foreground
                        focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20
                      "
                    >
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-popover">
                      {YEARS.map((y) => (
                        <SelectItem key={y} value={y} className="text-[13px]">
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldWrap>
              </div>

              {/* Descrição */}
              <FieldWrap label="Descrição" htmlFor="folder-desc" optional>
                <Textarea
                  id="folder-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição da pasta..."
                  rows={3}
                  className="
                    min-h-[80px] resize-y border-edis-line-2 bg-edis-ink-2
                    text-[13px] placeholder:text-edis-text-4
                    focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20
                  "
                />
              </FieldWrap>
            </div>

            {/* Right column — upload */}
            <FieldWrap label="Arquivos" optional>
              <label
                htmlFor="folder-files"
                className="
                  group flex min-h-[160px] flex-col items-center justify-center gap-3
                  rounded-lg border border-dashed border-edis-line-2 bg-edis-ink-2/60 p-5
                  text-center transition-colors duration-150
                  hover:border-primary/40 hover:bg-edis-ink-2
                  focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20
                  cursor-pointer
                "
              >
                <div className="flex size-10 items-center justify-center rounded-md border border-edis-line-2 bg-edis-ink-3 text-edis-text-2 transition-colors group-hover:border-primary/20 group-hover:text-primary">
                  <Icon icon={CloudUploadIcon} size={20} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[13px] font-medium text-foreground">
                    Clique para selecionar
                  </span>
                  <span className="text-[11.5px] text-edis-text-4">
                    Imagens, vídeos e outros
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  id="folder-files"
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                  className="sr-only"
                  onChange={(e) => handleFilesPicked(e.target.files)}
                />
              </label>

              {files.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-edis-text-3">
                    {files.length === 1
                      ? "1 arquivo selecionado"
                      : `${files.length} arquivos selecionados`}
                  </span>
                  <ul className="grid grid-cols-3 gap-2">
                    {files.map((f, i) => (
                      <FilePreview
                        key={`${f.name}-${f.size}-${i}`}
                        file={f}
                        onRemove={() =>
                          setFiles((prev) =>
                            prev.filter((_, idx) => idx !== i)
                          )
                        }
                      />
                    ))}
                  </ul>
                </div>
              )}
            </FieldWrap>
          </div>

          {/* Footer (sticky).
              Override shadcn defaults: `-mx-4 -mb-4 bg-muted/50 rounded-b-xl`
              are designed for DialogContent's default `p-4`. We use `p-0` on
              the content so we reset margins and reuse the card bg + rounded. */}
          <DialogFooter className="m-0 flex-row justify-end gap-2 rounded-b-xl border-t border-border bg-card px-5 py-3 sm:justify-end">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
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
              Criar pasta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── helpers ────────────────────────────────────────────────────────────────

function FieldWrap({
  label,
  required,
  optional,
  htmlFor,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
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
        {optional && (
          <span className="ml-1.5 normal-case tracking-normal text-edis-text-4/70">
            (opcional)
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function FilePreview({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const kind = fileKind(file);

  // Create an object URL for previewable types (image/video) and revoke on
  // unmount so we don't leak memory.
  useEffect(() => {
    if (kind === "image" || kind === "video") {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file, kind]);

  return (
    <li className="flex flex-col gap-1.5">
      <div className="group/preview relative aspect-square overflow-hidden rounded-md border border-edis-line-2 bg-edis-ink-3">
        {kind === "image" && previewUrl && (
          // Using <img> (not next/image) because the src is a blob URL.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={file.name}
            className="h-full w-full object-cover"
          />
        )}
        {kind === "video" && previewUrl && (
          <video
            src={previewUrl}
            className="h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
        )}
        {kind === "other" && (
          <div className="flex h-full w-full items-center justify-center text-edis-text-3">
            <Icon icon={File01Icon} size={22} strokeWidth={1.5} />
          </div>
        )}
        {kind === "video" && (
          <div className="pointer-events-none absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white/90">
            <Icon icon={VideoReplayIcon} size={10} className="inline" /> video
          </div>
        )}
        <button
          type="button"
          aria-label={`Remover ${file.name}`}
          onClick={onRemove}
          className="
            absolute right-1 top-1 flex size-5 items-center justify-center
            rounded bg-black/70 text-white opacity-0 transition-opacity
            group-hover/preview:opacity-100 focus-visible:opacity-100
            hover:bg-black/85
          "
        >
          <Icon icon={Cancel01Icon} size={11} strokeWidth={2} />
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

// ─── utilities ──────────────────────────────────────────────────────────────

function fileKind(file: File): "image" | "video" | "other" {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "other";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
