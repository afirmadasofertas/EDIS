"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Edit03Icon } from "@hugeicons/core-free-icons";

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
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import type { PromptItem } from "@/app/(dashboard)/drive/_data";

export type PromptUpdate = {
  title: string;
  prompt: string;
  description?: string;
};

/* ─── Edit prompt ────────────────────────────────────────────────────────── */

export function EditPromptDialog({
  open,
  onOpenChange,
  prompt,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  prompt: PromptItem;
  onSave: (updates: PromptUpdate) => Promise<void> | void;
}) {
  const [title, setTitle] = useState(prompt.title);
  const [body, setBody] = useState(prompt.prompt);
  const [description, setDescription] = useState(prompt.description ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(prompt.title);
    setBody(prompt.prompt);
    setDescription(prompt.description ?? "");
    setError(null);
  }, [open, prompt]);

  const trimmedTitle = title.trim();
  const trimmedBody = body.trim();
  const trimmedDesc = description.trim();
  const originalDesc = (prompt.description ?? "").trim();
  const changed =
    trimmedTitle !== prompt.title ||
    trimmedBody !== prompt.prompt ||
    trimmedDesc !== originalDesc;
  const canSave =
    trimmedTitle.length > 0 && trimmedBody.length > 0 && changed && !submitting;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSave) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSave({
        title: trimmedTitle,
        prompt: trimmedBody,
        description: trimmedDesc.length > 0 ? trimmedDesc : undefined,
      });
      onOpenChange(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-lg
          flex-col gap-0 p-0
        "
      >
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <DialogHeader className="flex-row items-center gap-2 border-b border-border px-5 py-4">
            <div className="flex size-7 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
              <Icon icon={Edit03Icon} size={16} strokeWidth={1.5} />
            </div>
            <DialogTitle
              className="font-display text-[16px] font-medium tracking-tight text-foreground"
              style={{ letterSpacing: "-0.015em" }}
            >
              Editar prompt
            </DialogTitle>
            <DialogDescription className="sr-only">
              Atualize título, conteúdo e descrição do prompt.
            </DialogDescription>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
            <FieldWrap label="Nome do prompt" required htmlFor="edit-prompt-title">
              <Input
                id="edit-prompt-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
                className="
                  h-9 border-edis-line-2 bg-edis-ink-2 text-[13px]
                  focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20
                "
              />
            </FieldWrap>

            <FieldWrap label="Prompt" required htmlFor="edit-prompt-body">
              <Textarea
                id="edit-prompt-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={7}
                className="
                  min-h-[170px] resize-y border-edis-line-2 bg-edis-ink-2
                  font-mono text-[12px] leading-6
                  focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20
                "
              />
            </FieldWrap>

            <FieldWrap label="Descrição" htmlFor="edit-prompt-desc" optional>
              <Textarea
                id="edit-prompt-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Quando usar, objetivo, observações..."
                rows={3}
                className="
                  min-h-[80px] resize-y border-edis-line-2 bg-edis-ink-2
                  text-[13px] placeholder:text-edis-text-4
                  focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20
                "
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
                {submitting ? "Salvando…" : "Atualizar"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Delete prompt ──────────────────────────────────────────────────────── */

export function DeletePromptDialog({
  open,
  onOpenChange,
  title,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  onConfirm: () => Promise<void> | void;
}) {
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md gap-0 p-0">
        <DialogHeader className="flex-col items-start gap-1.5 border-b border-border px-5 py-4">
          <DialogTitle
            className="font-display text-[16px] font-medium tracking-tight text-foreground"
            style={{ letterSpacing: "-0.015em" }}
          >
            Excluir prompt
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-[1.5] text-edis-text-3">
            Tem certeza que deseja excluir{" "}
            <span className="font-medium text-foreground">
              &ldquo;{title}&rdquo;
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
            disabled={submitting}
            onClick={handleConfirm}
            className="h-9 bg-[#ff5470] text-[13px] font-medium text-white hover:bg-[#ff3a5a] disabled:opacity-50"
          >
            {submitting ? "Excluindo…" : "Excluir prompt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── helpers ────────────────────────────────────────────────────────────── */

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
