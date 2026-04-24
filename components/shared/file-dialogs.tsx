"use client";

import { useEffect, useState } from "react";
import {
  File01Icon,
  VideoReplayIcon,
  Download01Icon,
  LinkSquare02Icon,
  Cancel01Icon,
  Comment01Icon,
} from "@hugeicons/core-free-icons";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/icon";
import { AnnotationCanvas } from "@/components/shared/annotation-canvas";
import { cn } from "@/lib/utils";
import {
  addAnnotation,
  deleteAnnotation,
  formatRelative,
  getAnnotations,
  moveAnnotation,
  updateAnnotation,
  type Annotation,
} from "@/app/(dashboard)/drive/_annotations";

/* ─── Preview ────────────────────────────────────────────────────────────── */

export function FilePreviewDialog({
  open,
  onOpenChange,
  fileId,
  name,
  thumbnailUrl,
  kind,
  onDownload,
  annotationsEnabled = true,
  author = "Você",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  /** Optional — when provided and the file is an image, enables annotations. */
  fileId?: string;
  name: string;
  thumbnailUrl?: string;
  kind: "image" | "video" | "other";
  onDownload: () => void;
  /** Set to false on the public share page to disable authoring. */
  annotationsEnabled?: boolean;
  /** Author name attached to new annotations (e.g. "Você" vs "Cliente"). */
  author?: string;
}) {
  const [annotateMode, setAnnotateMode] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activePinId, setActivePinId] = useState<string | null>(null);

  const canAnnotate =
    annotationsEnabled && !!fileId && kind === "image" && !!thumbnailUrl;

  // Load annotations whenever the dialog opens for a (possibly different) file.
  useEffect(() => {
    if (!open || !fileId) {
      setAnnotations([]);
      setActivePinId(null);
      setAnnotateMode(false);
      return;
    }
    setAnnotations(getAnnotations(fileId));
    setActivePinId(null);
  }, [open, fileId]);

  function handleAddAnnotation(x: number, y: number) {
    if (!fileId) return;
    const created = addAnnotation(fileId, x, y, author);
    setAnnotations((prev) => [...prev, created]);
    setActivePinId(created.id);
  }
  function handleSaveNote(id: string, note: string) {
    updateAnnotation(id, note);
    setAnnotations((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, note, updatedAt: Date.now() } : a
      )
    );
  }
  function handleDelete(id: string) {
    deleteAnnotation(id);
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    setActivePinId((pid) => (pid === id ? null : pid));
  }
  function handleMove(id: string, x: number, y: number) {
    moveAnnotation(id, x, y);
    setAnnotations((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, x, y, updatedAt: Date.now() } : a
      )
    );
  }

  const showCommentsStrip =
    canAnnotate && (annotateMode || annotations.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="
          flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-6xl
          flex-col gap-0 p-0
        "
      >
        <DialogHeader className="flex-row items-center gap-2 border-b border-border px-4 py-3">
          <DialogTitle className="truncate text-[13.5px] font-medium text-foreground">
            {name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Visualização do arquivo {name}
          </DialogDescription>
          <div className="ml-auto flex items-center gap-2">
            {canAnnotate && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAnnotateMode((m) => !m)}
                aria-pressed={annotateMode}
                className={cn(
                  "h-8 gap-1.5 border-edis-line-2 bg-edis-ink-2 text-[12px] hover:bg-edis-ink-3",
                  annotateMode
                    ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                    : "text-edis-text-2 hover:text-foreground"
                )}
              >
                <Icon
                  icon={Comment01Icon}
                  size={14}
                  strokeWidth={1.75}
                  className="size-[14px]"
                />
                Comentar
                {annotations.length > 0 && (
                  <span className="font-mono text-[10.5px] text-edis-text-4">
                    · {annotations.length}
                  </span>
                )}
              </Button>
            )}
            {thumbnailUrl && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="h-8 gap-1.5 border-edis-line-2 bg-edis-ink-2 text-[12px] text-edis-text-2 hover:bg-edis-ink-3 hover:text-foreground"
              >
                <a href={thumbnailUrl} target="_blank" rel="noopener noreferrer">
                  <Icon
                    icon={LinkSquare02Icon}
                    size={14}
                    strokeWidth={1.75}
                    className="size-[14px]"
                  />
                  Abrir
                </a>
              </Button>
            )}
            {thumbnailUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onDownload}
                className="h-8 gap-1.5 border-edis-line-2 bg-edis-ink-2 text-[12px] text-edis-text-2 hover:bg-edis-ink-3 hover:text-foreground"
              >
                <Icon
                  icon={Download01Icon}
                  size={14}
                  strokeWidth={1.75}
                  className="size-[14px]"
                />
                Baixar
              </Button>
            )}
            <DialogClose
              aria-label="Fechar"
              className="flex size-8 items-center justify-center rounded-md text-edis-text-3 transition-colors hover:bg-edis-ink-3 hover:text-foreground"
            >
              <Icon
                icon={Cancel01Icon}
                size={16}
                strokeWidth={1.75}
                className="size-[16px]"
              />
            </DialogClose>
          </div>
        </DialogHeader>

        {/* Body — vertical stack: big image on top, comments strip at the bottom */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-edis-ink-0 p-4 sm:p-6">
            {kind === "image" && thumbnailUrl ? (
              canAnnotate ? (
                <AnnotationCanvas
                  annotations={annotations}
                  editable={annotateMode}
                  activePinId={activePinId}
                  onAddAnnotation={handleAddAnnotation}
                  onSaveNote={handleSaveNote}
                  onDeleteAnnotation={handleDelete}
                  onMoveAnnotation={handleMove}
                  onActivate={setActivePinId}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnailUrl}
                    alt={name}
                    draggable={false}
                    className="max-h-[calc(100vh-18rem)] w-auto max-w-full rounded-md object-contain"
                  />
                </AnnotationCanvas>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbnailUrl}
                  alt={name}
                  className="max-h-[calc(100vh-12rem)] w-auto max-w-full rounded-md object-contain"
                />
              )
            ) : (
              <div className="flex flex-col items-center gap-3 py-20 text-edis-text-3">
                <Icon
                  icon={kind === "video" ? VideoReplayIcon : File01Icon}
                  size={48}
                  strokeWidth={1.5}
                  className="size-[48px]"
                />
                <span className="text-[13px]">
                  Prévia indisponível para este tipo de arquivo.
                </span>
              </div>
            )}
          </div>

          {showCommentsStrip && (
            <AnnotationStrip
              annotations={annotations}
              activePinId={activePinId}
              onSelect={setActivePinId}
              onDelete={handleDelete}
              annotateMode={annotateMode}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Annotation strip (bottom bar) ──────────────────────────────────────── */

function AnnotationStrip({
  annotations,
  activePinId,
  onSelect,
  onDelete,
  annotateMode,
}: {
  annotations: Annotation[];
  activePinId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  annotateMode: boolean;
}) {
  return (
    <aside className="flex shrink-0 flex-col border-t border-border bg-card">
      <header className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <Icon
          icon={Comment01Icon}
          size={14}
          strokeWidth={1.75}
          className="size-[14px] text-edis-text-3"
        />
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-edis-text-3">
          Comentários
        </span>
        <span className="font-mono text-[11px] text-edis-text-4">
          · {annotations.length}
        </span>
        {annotateMode && annotations.length === 0 && (
          <span className="ml-auto font-mono text-[10.5px] text-edis-text-4">
            Clique na imagem pra dropar um pin
          </span>
        )}
      </header>

      {annotations.length === 0 ? (
        <div className="flex items-center justify-center px-4 py-6">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <span className="edis-tag">Sem comentários</span>
            <p className="text-[11.5px] leading-[1.5] text-edis-text-3">
              {annotateMode
                ? "Clique em qualquer ponto da imagem acima pra adicionar um pin."
                : "Ative o modo Comentar pra começar."}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto p-3">
          {annotations.map((a, i) => (
            <article
              key={a.id}
              onClick={() =>
                onSelect(a.id === activePinId ? null : a.id)
              }
              className={cn(
                "group/row flex min-w-[240px] max-w-[320px] shrink-0 cursor-pointer gap-2.5 rounded-md border p-2.5 transition-colors",
                a.id === activePinId
                  ? "border-primary/40 bg-primary/5"
                  : "border-edis-line-2 bg-edis-ink-2 hover:border-edis-line-3 hover:bg-edis-ink-3"
              )}
            >
              <span
                className="
                  flex size-5 shrink-0 items-center justify-center rounded-full
                  bg-primary font-mono text-[10px] font-semibold text-primary-foreground
                "
              >
                {i + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="line-clamp-2 text-[12.5px] leading-[1.35] text-foreground">
                  {a.note || (
                    <span className="italic text-edis-text-4">
                      (sem texto)
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-edis-text-4">
                  <span>
                    ({Math.round(a.x * 100)}%, {Math.round(a.y * 100)}%)
                  </span>
                  <span>·</span>
                  <span className="truncate">{a.author}</span>
                  <span>·</span>
                  <span className="shrink-0">
                    {formatRelative(a.updatedAt)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                aria-label="Excluir comentário"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(a.id);
                }}
                className="
                  flex size-6 shrink-0 items-center justify-center rounded
                  text-edis-text-4 opacity-0 transition-opacity
                  group-hover/row:opacity-100
                  hover:text-[#ff5470] focus-visible:opacity-100
                "
              >
                <Icon
                  icon={Cancel01Icon}
                  size={12}
                  strokeWidth={2}
                  className="size-[12px]"
                />
              </button>
            </article>
          ))}
        </div>
      )}
    </aside>
  );
}

/* ─── Rename ─────────────────────────────────────────────────────────────── */

export function RenameFileDialog({
  open,
  onOpenChange,
  currentName,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  currentName: string;
  onSave: (newName: string) => void;
}) {
  const [value, setValue] = useState(currentName);

  useEffect(() => {
    if (open) setValue(currentName);
  }, [open, currentName]);

  const canSave = value.trim().length > 0 && value.trim() !== currentName;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSave) return;
    onSave(value.trim());
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md gap-0 p-0">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <DialogHeader className="flex-col items-start gap-1 border-b border-border px-5 py-4">
            <DialogTitle
              className="font-display text-[16px] font-medium tracking-tight text-foreground"
              style={{ letterSpacing: "-0.015em" }}
            >
              Renomear arquivo
            </DialogTitle>
            <DialogDescription className="text-[12.5px] text-edis-text-3">
              Digite o novo nome para o arquivo.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5 p-5">
            <label
              htmlFor="rename-file-input"
              className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-edis-text-4"
            >
              Nome do arquivo
            </label>
            <Input
              id="rename-file-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              required
              className="h-9 border-edis-line-2 bg-edis-ink-2 text-[13px] placeholder:text-edis-text-4 focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>

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
              disabled={!canSave}
              className="h-9 bg-primary text-[13px] font-medium text-primary-foreground hover:bg-[#33eb8c] disabled:opacity-50"
            >
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Delete ─────────────────────────────────────────────────────────────── */

export function DeleteFileDialog({
  open,
  onOpenChange,
  name,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  name: string;
  onConfirm: () => void;
}) {
  function handleConfirm() {
    onConfirm();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md gap-0 p-0">
        <DialogHeader className="flex-col items-start gap-1.5 border-b border-border px-5 py-4">
          <DialogTitle
            className="font-display text-[16px] font-medium tracking-tight text-foreground"
            style={{ letterSpacing: "-0.015em" }}
          >
            Excluir arquivo
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-[1.5] text-edis-text-3">
            Tem certeza que deseja excluir{" "}
            <span className="font-medium text-foreground">
              &ldquo;{name}&rdquo;
            </span>
            ? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

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
            type="button"
            size="sm"
            onClick={handleConfirm}
            className="h-9 bg-[#ff5470] text-[13px] font-medium text-white hover:bg-[#ff3a5a]"
          >
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
