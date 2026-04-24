"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Delete02Icon, Tick02Icon } from "@hugeicons/core-free-icons";

import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  formatRelative,
  type Annotation,
} from "@/app/(dashboard)/drive/_annotations";

interface AnnotationCanvasProps {
  annotations: Annotation[];
  /** When true the canvas captures clicks on empty space + lets pins be dragged. */
  editable: boolean;
  activePinId: string | null;
  onAddAnnotation: (xRel: number, yRel: number) => void;
  onSaveNote: (id: string, note: string) => void;
  onDeleteAnnotation: (id: string) => void;
  onMoveAnnotation: (id: string, xRel: number, yRel: number) => void;
  onActivate: (id: string | null) => void;
  children: ReactNode;
}

/**
 * Wraps a rendered image (passed as children) and overlays numbered pins plus
 * a note popover for the active pin. Coordinates are stored as 0..1 relative
 * to the image so pins stay anchored when the viewport resizes.
 *
 * In editable mode:
 *  - Click on empty canvas drops a new pin.
 *  - Existing pins can be dragged to reposition.
 */
export function AnnotationCanvas({
  annotations,
  editable,
  activePinId,
  onAddAnnotation,
  onSaveNote,
  onDeleteAnnotation,
  onMoveAnnotation,
  onActivate,
  children,
}: AnnotationCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);

  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!editable) return;
    if (!wrapperRef.current) return;
    // Ignore clicks that bubbled up from pins / popovers.
    const target = e.target as HTMLElement;
    if (target.closest("[data-edis-pin]")) return;
    if (target.closest("[data-edis-note]")) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;
    onAddAnnotation(x, y);
  }

  /** Begin tracking a drag; Pin calls this on mousedown. */
  const startDrag = useCallback(
    (id: string, initialClient: { x: number; y: number }) => {
      if (!editable) return;
      if (!wrapperRef.current) return;

      const wrapper = wrapperRef.current;
      let dragged = false;
      const startX = initialClient.x;
      const startY = initialClient.y;
      const THRESHOLD = 4; // px before we commit to drag mode

      function handleMove(ev: MouseEvent) {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (!dragged && Math.hypot(dx, dy) < THRESHOLD) return;
        dragged = true;
        const rect = wrapper.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (ev.clientY - rect.top) / rect.height));
        setDragging({ id, x, y });
      }

      function handleUp() {
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleUp);
        setDragging((current) => {
          if (current && dragged) {
            onMoveAnnotation(current.id, current.x, current.y);
          } else {
            // Treat as a plain click.
            onActivate(activePinId === id ? null : id);
          }
          return null;
        });
      }

      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleUp);
    },
    [editable, onMoveAnnotation, onActivate, activePinId]
  );

  // Safety net — clean listeners if component unmounts mid-drag.
  useEffect(() => {
    return () => setDragging(null);
  }, []);

  return (
    <div
      ref={wrapperRef}
      onClick={handleCanvasClick}
      className={cn(
        "relative inline-block select-none",
        editable ? "cursor-crosshair" : "cursor-default"
      )}
    >
      {children}

      {annotations.map((a, i) => {
        const isDragTarget = dragging?.id === a.id;
        return (
          <Pin
            key={a.id}
            annotation={a}
            index={i + 1}
            active={activePinId === a.id}
            editable={editable}
            draggingPos={isDragTarget ? { x: dragging.x, y: dragging.y } : null}
            onStartDrag={(client) => startDrag(a.id, client)}
            onPlainClick={() =>
              onActivate(activePinId === a.id ? null : a.id)
            }
            onSave={(note) => onSaveNote(a.id, note)}
            onDelete={() => onDeleteAnnotation(a.id)}
          />
        );
      })}
    </div>
  );
}

/* ─── Pin + Note popover ─────────────────────────────────────────────────── */

function Pin({
  annotation,
  index,
  active,
  editable,
  draggingPos,
  onStartDrag,
  onPlainClick,
  onSave,
  onDelete,
}: {
  annotation: Annotation;
  index: number;
  active: boolean;
  editable: boolean;
  /** When set, overrides the stored x/y for live drag feedback. */
  draggingPos: { x: number; y: number } | null;
  onStartDrag: (initialClient: { x: number; y: number }) => void;
  onPlainClick: () => void;
  onSave: (note: string) => void;
  onDelete: () => void;
}) {
  const x = draggingPos ? draggingPos.x : annotation.x;
  const y = draggingPos ? draggingPos.y : annotation.y;
  const isDragging = Boolean(draggingPos);

  const style: React.CSSProperties = {
    position: "absolute",
    left: `${x * 100}%`,
    top: `${y * 100}%`,
    transform: "translate(-50%, -100%)",
    touchAction: "none",
  };

  function handleMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    if (editable) {
      e.preventDefault();
      onStartDrag({ x: e.clientX, y: e.clientY });
    } else {
      // Non-editable: mousedown shouldn't select text etc.
      // The click handler below will still fire.
    }
  }

  function handleClick(e: React.MouseEvent) {
    // In edit mode clicks are handled via mousedown/mouseup in startDrag.
    // In view mode, a regular click toggles the popover.
    if (editable) return;
    e.stopPropagation();
    onPlainClick();
  }

  return (
    <div style={style} data-edis-pin>
      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        aria-label={`Comentário ${index}${annotation.note ? ": " + annotation.note : ""}`}
        className={cn(
          "relative flex size-7 items-center justify-center rounded-full",
          "font-mono text-[12px] font-semibold leading-none",
          "shadow-[0_4px_12px_rgba(0,0,0,0.45)] transition-transform duration-150",
          "bg-primary text-primary-foreground",
          editable ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-pointer",
          active
            ? "scale-110 ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
            : "hover:scale-105"
        )}
      >
        {!isDragging && (
          <span
            className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-primary/40"
            aria-hidden
            style={{ animationIterationCount: 1, animationDuration: "900ms" }}
          />
        )}
        <span className="relative">{index}</span>
      </button>

      {active && !isDragging && (
        <NotePopover
          note={annotation.note}
          author={annotation.author}
          updatedAt={annotation.updatedAt}
          editable={editable}
          onSave={onSave}
          onDelete={onDelete}
          onClose={() => onPlainClick()}
        />
      )}
    </div>
  );
}

function NotePopover({
  note,
  author,
  updatedAt,
  editable,
  onSave,
  onDelete,
  onClose,
}: {
  note: string;
  author: string;
  updatedAt: number;
  editable: boolean;
  onSave: (note: string) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [editing, setEditing] = useState(editable && note.length === 0);
  const [value, setValue] = useState(note);

  useEffect(() => {
    setValue(note);
    setEditing(editable && note.length === 0);
  }, [note, editable]);

  function handleSave() {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      onDelete();
      onClose();
      return;
    }
    onSave(trimmed);
    setEditing(false);
  }

  function handleCancel() {
    if (note.length === 0) {
      onDelete();
      onClose();
    } else {
      setValue(note);
      setEditing(false);
    }
  }

  return (
    <div
      data-edis-note
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="
        absolute left-1/2 top-full z-20 mt-2 w-72 -translate-x-1/2
        rounded-lg border border-border bg-popover
        shadow-[0_12px_36px_rgba(0,0,0,0.55)]
      "
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-edis-ink-3 font-mono text-[10px] font-medium text-edis-text-1">
          {authorInitials(author)}
        </div>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-[12px] font-medium text-foreground">
            {author}
          </span>
          <span className="font-mono text-[10px] text-edis-text-4">
            {formatRelative(updatedAt)}
          </span>
        </div>
        {!editing && note.length > 0 && editable && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-edis-text-3 hover:text-foreground"
          >
            Editar
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-2 p-3">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Escreva um comentário..."
            autoFocus
            rows={3}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                handleCancel();
              }
            }}
            className="min-h-[72px] resize-y border-edis-line-2 bg-edis-ink-2 text-[12.5px] placeholder:text-edis-text-4 focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20"
          />
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onDelete}
              aria-label="Excluir comentário"
              className="flex size-7 items-center justify-center rounded-md text-edis-text-3 transition-colors hover:bg-[#ff5470]/15 hover:text-[#ff5470]"
            >
              <Icon
                icon={Delete02Icon}
                size={14}
                strokeWidth={1.75}
                className="size-[14px]"
              />
            </button>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="h-7 border-edis-line-2 bg-transparent px-2.5 text-[12px] text-edis-text-2 hover:bg-edis-ink-3 hover:text-foreground"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                className="h-7 gap-1 bg-primary px-2.5 text-[12px] font-medium text-primary-foreground hover:bg-[#33eb8c]"
              >
                <Icon
                  icon={Tick02Icon}
                  size={12}
                  strokeWidth={2}
                  className="size-[12px]"
                />
                Salvar
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-3">
          <p className="whitespace-pre-wrap text-[12.5px] leading-[1.5] text-edis-text-2">
            {note}
          </p>
          {editable && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onDelete}
                aria-label="Excluir comentário"
                className="flex size-7 items-center justify-center rounded-md text-edis-text-3 transition-colors hover:bg-[#ff5470]/15 hover:text-[#ff5470]"
              >
                <Icon
                  icon={Delete02Icon}
                  size={14}
                  strokeWidth={1.75}
                  className="size-[14px]"
                />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function authorInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
