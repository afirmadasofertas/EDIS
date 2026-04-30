"use client";

import {
  Atom02Icon,
  OrthogonalEdgeIcon,
  MagicWand01Icon,
  Image02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";

const PHASE_META: Record<
  number,
  { icon: IconSvgElement; label: string; description: string }
> = {
  2: {
    icon: Atom02Icon,
    label: "DNA Brand",
    description:
      "Extração automática de identidade visual: cores, tipografia, estilo fotográfico e tom de voz da marca.",
  },
  3: {
    icon: OrthogonalEdgeIcon,
    label: "Templates",
    description:
      "40 templates preenchidos com copy da marca, organizados por categoria: Engajamento, Autoridade, Conversão e Viral.",
  },
  4: {
    icon: MagicWand01Icon,
    label: "Geração",
    description:
      "Geração das 40 imagens via API com progresso em tempo real, log por template e custo acumulado.",
  },
  5: {
    icon: Image02Icon,
    label: "Galeria",
    description:
      "Grid de anúncios gerados com filtros por categoria e aspect ratio, preview fullscreen e download ZIP organizado.",
  },
};

interface PhasePlaceholderProps {
  phase: number;
  onNext: () => void;
  onBack: () => void;
}

export function PhasePlaceholder({ phase, onNext, onBack }: PhasePlaceholderProps) {
  const meta = PHASE_META[phase];
  if (!meta) return null;

  const isLast = phase === 5;

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <div className="flex size-11 items-center justify-center rounded-md border border-edis-line-2 bg-edis-ink-3">
          <Icon icon={meta.icon} size={20} className="text-edis-text-2" />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <span className="edis-tag">{meta.label}</span>
          <p className="mt-1 max-w-sm text-[13.5px] leading-[1.6] text-edis-text-3">
            {meta.description}
          </p>
        </div>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-edis-text-4">
          Em construção · UI visual em breve
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-border px-6 py-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2 text-[13px] text-edis-text-3 hover:text-foreground"
        >
          <Icon icon={ArrowLeft01Icon} size={15} strokeWidth={2} />
          Voltar
        </Button>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-edis-text-4">
          Fase {phase} de 5
        </span>
        {!isLast && (
          <Button
            onClick={onNext}
            className="gap-2 bg-primary text-[13px] font-medium text-primary-foreground hover:bg-[#33eb8c]"
          >
            Continuar
            <Icon icon={ArrowRight01Icon} size={15} strokeWidth={2} />
          </Button>
        )}
        {isLast && (
          <Button
            disabled
            className="gap-2 bg-primary/20 text-[13px] font-medium text-primary/40"
          >
            Gerar Anúncios
            <Icon icon={ArrowRight01Icon} size={15} strokeWidth={2} />
          </Button>
        )}
      </div>
    </div>
  );
}
