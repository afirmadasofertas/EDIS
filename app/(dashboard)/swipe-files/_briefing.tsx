"use client";

import { useState } from "react";
import {
  Globe02Icon,
  CloudUploadIcon,
  Add01Icon,
  Cancel01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type InputMethod = "url" | "manual" | "hybrid";

const VISUAL_STYLES = [
  "Minimalista",
  "Luxury",
  "Playful",
  "Industrial",
  "Bold",
  "Editorial",
];

const METHOD_LABELS: Record<InputMethod, string> = {
  url: "Com URL",
  manual: "Manual",
  hybrid: "Híbrido",
};

export function BriefingPhase({ onNext }: { onNext: () => void }) {
  const [method, setMethod] = useState<InputMethod>("url");
  const [colors, setColors] = useState(["#00e573", "#111111"]);

  function addColor() {
    setColors((prev) => [...prev, "#ffffff"]);
  }

  function removeColor(i: number) {
    setColors((prev) => prev.filter((_, j) => j !== i));
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Method selector */}
      <div className="flex gap-1 rounded-lg border border-edis-line-2 bg-edis-ink-2 p-1">
        {(["url", "manual", "hybrid"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-[13px] font-medium transition-all duration-150",
              method === m
                ? "bg-edis-ink-4 text-foreground ring-1 ring-edis-line-3"
                : "text-edis-text-3 hover:text-edis-text-2"
            )}
          >
            {METHOD_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-6 p-6">

          {/* URL field */}
          {(method === "url" || method === "hybrid") && (
            <div className="flex flex-col gap-2">
              <FormLabel>URL da Marca</FormLabel>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-edis-text-4">
                    <Icon icon={Globe02Icon} size={15} />
                  </div>
                  <Input
                    placeholder="https://suamarca.com.br"
                    className="border-edis-line-2 bg-edis-ink-2 pl-9 text-[14px] placeholder:text-edis-text-4 focus-visible:border-edis-line-3 focus-visible:ring-edis-mint/20"
                  />
                </div>
                {method === "url" && (
                  <Button className="shrink-0 bg-primary text-[13px] font-medium text-primary-foreground hover:bg-[#33eb8c]">
                    Analisar Marca
                  </Button>
                )}
              </div>
              {method === "url" && (
                <p className="text-[12px] text-edis-text-4">
                  O sistema extrai cores, fontes e estilo visual automaticamente.
                </p>
              )}
            </div>
          )}

          {/* Divider between URL and manual fields in hybrid */}
          {method === "hybrid" && (
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-edis-line-1" />
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-edis-text-4">
                complementar
              </span>
              <div className="h-px flex-1 bg-edis-line-1" />
            </div>
          )}

          {/* Manual fields */}
          {(method === "manual" || method === "hybrid") && (
            <div className="flex flex-col gap-5">

              {/* Brand name */}
              <div className="flex flex-col gap-2">
                <FormLabel>Nome da Marca</FormLabel>
                <Input
                  placeholder="Ex: Natura, Havaianas, iFood…"
                  className="border-edis-line-2 bg-edis-ink-2 text-[14px] placeholder:text-edis-text-4 focus-visible:border-edis-line-3 focus-visible:ring-edis-mint/20"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <FormLabel hint="20–100 palavras">Descrição do Negócio</FormLabel>
                <textarea
                  rows={3}
                  placeholder="Descreva o que a marca vende, para quem e qual o diferencial…"
                  className="flex w-full resize-none rounded-md border border-edis-line-2 bg-edis-ink-2 px-3 py-2.5 text-[14px] text-foreground outline-none placeholder:text-edis-text-4 transition-colors focus-visible:border-edis-line-3 focus-visible:ring-2 focus-visible:ring-edis-mint/20"
                />
              </div>

              {/* Colors */}
              <div className="flex flex-col gap-2">
                <FormLabel>Cores Principais</FormLabel>
                <div className="flex flex-wrap items-center gap-2">
                  {colors.map((color, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-md border border-edis-line-2 bg-edis-ink-2 px-2.5 py-1.5"
                    >
                      <div
                        className="size-3.5 shrink-0 rounded-full border border-black/20"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-mono text-[12px] text-edis-text-2">
                        {color}
                      </span>
                      <button
                        onClick={() => removeColor(i)}
                        className="text-edis-text-4 transition-colors hover:text-foreground"
                      >
                        <Icon icon={Cancel01Icon} size={11} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addColor}
                    className="flex items-center gap-1.5 rounded-md border border-dashed border-edis-line-3 px-2.5 py-1.5 text-[12px] text-edis-text-4 transition-colors hover:border-edis-line-3 hover:text-edis-text-2"
                  >
                    <Icon icon={Add01Icon} size={12} />
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Visual style + Typography */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <FormLabel>Estilo Visual</FormLabel>
                  <Select>
                    <SelectTrigger className="border-edis-line-2 bg-edis-ink-2 text-[13.5px] focus:ring-edis-mint/20">
                      <SelectValue placeholder="Selecionar…" />
                    </SelectTrigger>
                    <SelectContent className="border-edis-line-2 bg-edis-ink-3">
                      {VISUAL_STYLES.map((s) => (
                        <SelectItem key={s} value={s.toLowerCase()} className="text-[13.5px]">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <FormLabel hint="opcional">Tipografia Preferida</FormLabel>
                  <Input
                    placeholder="Ex: Helvetica + Georgia"
                    className="border-edis-line-2 bg-edis-ink-2 text-[13.5px] placeholder:text-edis-text-4 focus-visible:border-edis-line-3 focus-visible:ring-edis-mint/20"
                  />
                </div>
              </div>

              {/* Audience */}
              <div className="flex flex-col gap-2">
                <FormLabel>Público-alvo</FormLabel>
                <textarea
                  rows={2}
                  placeholder="Ex: Mulheres 25–40 anos, classe A/B, interessadas em skincare premium…"
                  className="flex w-full resize-none rounded-md border border-edis-line-2 bg-edis-ink-2 px-3 py-2.5 text-[14px] text-foreground outline-none placeholder:text-edis-text-4 transition-colors focus-visible:border-edis-line-3 focus-visible:ring-2 focus-visible:ring-edis-mint/20"
                />
              </div>
            </div>
          )}

          {/* Upload area */}
          <div className="flex flex-col gap-2">
            <FormLabel hint="opcional · recomendado 3">Imagens do Produto</FormLabel>
            <div className="group flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-dashed border-edis-line-2 bg-edis-ink-2/30 px-6 py-8 transition-all hover:border-edis-line-3 hover:bg-edis-ink-2/60">
              <div className="flex size-10 items-center justify-center rounded-full border border-edis-line-2 bg-edis-ink-3 transition-colors group-hover:border-edis-line-3">
                <Icon icon={CloudUploadIcon} size={18} className="text-edis-text-3" />
              </div>
              <div className="text-center">
                <p className="text-[13.5px] font-medium text-edis-text-2">
                  Arraste as imagens aqui
                </p>
                <p className="mt-0.5 text-[12px] text-edis-text-4">
                  Frontal, ângulo, lifestyle · JPG, PNG, WebP
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-edis-line-2 bg-edis-ink-3 text-[12.5px] text-edis-text-2 hover:bg-edis-ink-4 hover:text-foreground"
              >
                Selecionar arquivos
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-edis-text-4">
            Fase 1 de 5
          </span>
          <Button
            onClick={onNext}
            className="gap-2 bg-primary text-[13px] font-medium text-primary-foreground hover:bg-[#33eb8c]"
          >
            {method === "url" ? "Analisar Marca" : "Continuar"}
            <Icon icon={ArrowRight01Icon} size={15} strokeWidth={2} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function FormLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-edis-text-4">
      {children}
      {hint && (
        <span className="normal-case tracking-normal text-edis-text-4">
          · {hint}
        </span>
      )}
    </label>
  );
}
