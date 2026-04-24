"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  Add01Icon,
  Cancel01Icon,
  CloudUploadIcon,
  File02Icon,
  FileAttachmentIcon,
  Image02Icon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/icon";

interface NewPromptDialogProps {
  trigger: ReactNode;
}

export function NewPromptDialog({ trigger }: NewPromptDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = title.trim().length > 0 && prompt.trim().length > 0;

  function resetForm() {
    setTitle("");
    setPrompt("");
    setDescription("");
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    // TODO: wire to backend.
    // eslint-disable-next-line no-console
    console.log("[new-prompt]", { title, prompt, description, files });
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
          flex-col gap-0 p-0 sm:max-w-2xl
        "
      >
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <DialogHeader className="flex-row items-center gap-2 border-b border-border px-5 py-4">
            <div className="flex size-7 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
              <Icon icon={Add01Icon} size={16} strokeWidth={1.5} />
            </div>
            <DialogTitle
              className="font-display text-[16px] font-medium tracking-tight text-foreground"
              style={{ letterSpacing: "-0.015em" }}
            >
              Novo Prompt
            </DialogTitle>
            <DialogDescription className="sr-only">
              Salve um prompt e envie arquivos para a IA ler como contexto.
            </DialogDescription>
          </DialogHeader>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-y-auto p-5 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <FieldWrap label="Nome do prompt" required htmlFor="prompt-title">
                <Input
                  id="prompt-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Criativo UGC estático"
                  required
                  className="
                    h-9 border-edis-line-2 bg-edis-ink-2 text-[13px]
                    placeholder:text-edis-text-4
                    focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20
                  "
                />
              </FieldWrap>

              <FieldWrap label="Prompt" required htmlFor="prompt-body">
                <Textarea
                  id="prompt-body"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Escreva o prompt principal..."
                  required
                  rows={7}
                  className="
                    min-h-[170px] resize-y border-edis-line-2 bg-edis-ink-2
                    font-mono text-[12px] leading-6 placeholder:text-edis-text-4
                    focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20
                  "
                />
              </FieldWrap>

              <FieldWrap label="Descrição" htmlFor="prompt-desc" optional>
                <Textarea
                  id="prompt-desc"
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

            <div className="flex flex-col gap-4">
              <FieldWrap label="Contexto para IA" optional>
                <label
                  htmlFor="prompt-files"
                  className="
                    group flex min-h-[210px] cursor-pointer flex-col items-center
                    justify-center gap-3 rounded-lg border border-dashed
                    border-edis-line-2 bg-edis-ink-2/60 p-5 text-center
                    transition-colors duration-150
                    hover:border-primary/40 hover:bg-edis-ink-2
                    focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20
                  "
                >
                  <div className="flex size-10 items-center justify-center rounded-md border border-edis-line-2 bg-edis-ink-3 text-edis-text-2 transition-colors group-hover:border-primary/20 group-hover:text-primary">
                    <Icon icon={CloudUploadIcon} size={20} strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[13px] font-medium text-foreground">
                      Enviar contexto
                    </span>
                    <span className="text-[11.5px] text-edis-text-4">
                      Textos, imagens, PDFs e arquivos de referência
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    id="prompt-files"
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt,.md,.csv"
                    className="sr-only"
                    onChange={(e) => handleFilesPicked(e.target.files)}
                  />
                </label>
              </FieldWrap>

              <div className="flex flex-wrap gap-1.5">
                <MiniChip icon={File02Icon} label="Texto" />
                <MiniChip icon={Image02Icon} label="Imagem" />
                <MiniChip icon={FileAttachmentIcon} label="Arquivo" />
              </div>

              {files.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-edis-text-3">
                    {files.length === 1
                      ? "1 anexo selecionado"
                      : `${files.length} anexos selecionados`}
                  </span>
                  <ul className="flex flex-col gap-1.5">
                    {files.map((file, i) => (
                      <li
                        key={`${file.name}-${file.size}-${i}`}
                        className="flex items-center gap-2 rounded-md border border-edis-line-2 bg-edis-ink-2 px-2 py-1.5"
                      >
                        <Icon
                          icon={FileAttachmentIcon}
                          size={13}
                          strokeWidth={1.75}
                          className="size-[13px] shrink-0 text-edis-text-3"
                        />
                        <span className="min-w-0 flex-1 truncate text-[12px] text-edis-text-2">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          aria-label={`Remover ${file.name}`}
                          onClick={() =>
                            setFiles((prev) =>
                              prev.filter((_, idx) => idx !== i)
                            )
                          }
                          className="flex size-6 items-center justify-center rounded text-edis-text-4 hover:bg-edis-ink-3 hover:text-foreground"
                        >
                          <Icon icon={Cancel01Icon} size={12} strokeWidth={2} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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
              disabled={!canSubmit}
              className="
                h-9 rounded-md bg-primary px-3.5 text-[13px] font-medium
                text-primary-foreground hover:bg-[#33eb8c]
                disabled:pointer-events-none disabled:opacity-50
              "
            >
              Salvar prompt
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldWrap({
  label,
  htmlFor,
  required,
  optional,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-[12px] font-medium text-edis-text-2"
        >
          {label}
          {required && <span className="ml-1 text-primary">*</span>}
        </label>
        {optional && (
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-edis-text-4">
            Opcional
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function MiniChip({
  icon,
  label,
}: {
  icon: typeof File02Icon;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-edis-line-2 bg-edis-ink-2 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-edis-text-3">
      <Icon icon={icon} size={10} strokeWidth={1.75} className="size-[10px]" />
      {label}
    </span>
  );
}
