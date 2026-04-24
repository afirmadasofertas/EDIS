"use client";

import { useEffect, useState, type ReactNode } from "react";
import { FolderAddIcon } from "@hugeicons/core-free-icons";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import type { DriveFolder, DriveFolderUpdate } from "@/app/(dashboard)/drive/_data";

const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const YEARS = ["2024", "2025", "2026", "2027", "2028"];

/* ─── Edit folder ────────────────────────────────────────────────────────── */

export function EditFolderDialog({
  open,
  onOpenChange,
  folder,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  folder: DriveFolder;
  onSave: (updates: DriveFolderUpdate) => void;
}) {
  const [name, setName] = useState(folder.name);
  const [month, setMonth] = useState(folder.month);
  const [year, setYear] = useState(folder.year.toString());
  const [description, setDescription] = useState(folder.description ?? "");

  // Re-sync whenever the dialog opens for a (possibly new) folder.
  useEffect(() => {
    if (!open) return;
    setName(folder.name);
    setMonth(folder.month);
    setYear(folder.year.toString());
    setDescription(folder.description ?? "");
  }, [open, folder]);

  const trimmedName = name.trim();
  const trimmedDesc = description.trim();
  const originalDesc = (folder.description ?? "").trim();
  const changed =
    trimmedName !== folder.name ||
    month !== folder.month ||
    year !== folder.year.toString() ||
    trimmedDesc !== originalDesc;
  const canSave = trimmedName.length > 0 && changed;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSave) return;
    onSave({
      name: trimmedName,
      month,
      year: Number.parseInt(year, 10),
      description: trimmedDesc.length > 0 ? trimmedDesc : undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-md
          flex-col gap-0 p-0
        "
      >
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          {/* Header */}
          <DialogHeader className="flex-row items-center gap-2 border-b border-border px-5 py-4">
            <div className="flex size-7 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
              <Icon
                icon={FolderAddIcon}
                size={16}
                strokeWidth={1.5}
                className="size-[16px]"
              />
            </div>
            <DialogTitle
              className="font-display text-[16px] font-medium tracking-tight text-foreground"
              style={{ letterSpacing: "-0.015em" }}
            >
              Editar pasta
            </DialogTitle>
            <DialogDescription className="sr-only">
              Atualize os dados da pasta.
            </DialogDescription>
          </DialogHeader>

          {/* Body */}
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
            <FieldWrap label="Nome da oferta" required htmlFor="edit-folder-name">
              <Input
                id="edit-folder-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                className="
                  h-9 border-edis-line-2 bg-edis-ink-2 text-[13px]
                  placeholder:text-edis-text-4
                  focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20
                "
              />
            </FieldWrap>

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
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger
                    data-size="default"
                    className="
                      h-9 w-full border-edis-line-2 bg-edis-ink-2 text-[13px]
                      text-foreground
                      focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20
                    "
                  >
                    <SelectValue />
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

            <FieldWrap label="Descrição" htmlFor="edit-folder-desc" optional>
              <Textarea
                id="edit-folder-desc"
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

          {/* Footer */}
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
              Atualizar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Delete folder ──────────────────────────────────────────────────────── */

export function DeleteFolderDialog({
  open,
  onOpenChange,
  name,
  fileCount,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  name: string;
  fileCount: number;
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
            Excluir pasta
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-[1.5] text-edis-text-3">
            Tem certeza que deseja excluir{" "}
            <span className="font-medium text-foreground">
              &ldquo;{name}&rdquo;
            </span>
            ?{" "}
            {fileCount > 0 && (
              <>
                Os <span className="font-mono text-edis-text-2">{fileCount}</span>{" "}
                {fileCount === 1 ? "arquivo" : "arquivos"} dentro dela{" "}
                {fileCount === 1 ? "será" : "serão"} apagado{fileCount === 1 ? "" : "s"} junto.{" "}
              </>
            )}
            Esta ação não pode ser desfeita.
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
            Excluir pasta
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
