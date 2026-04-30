"use client";

import { useEffect, useState } from "react";
import {
  CloudUploadIcon,
  Download01Icon,
  MagicWand01Icon,
  StarIcon,
  Tick01Icon,
  AlertCircleIcon,
  Idea01Icon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/icon";
import { EdisLogo } from "@/components/layout/edis-logo";
import { SaveToDriveDialog } from "@/components/shared/save-to-drive-dialog";
import { cn } from "@/lib/utils";
import { useEditor } from "./_state";
import { loadFont } from "./_fonts";
import { toApiPayload, type Dimensions } from "./_types";

const ASPECT: Record<Dimensions, string> = {
  "9:16": "9 / 16",
  "4:5": "4 / 5",
  "16:9": "16 / 9",
  "1:1": "1 / 1",
};

type CritiqueResult = {
  scores: {
    identity: number;
    realism: number;
    hierarchy: number;
    typography: number;
    brief: number;
  };
  keep: string[];
  fix: string[];
  quickWins: string[];
  verdict: string;
};

const CRITIQUE_LABELS: Record<keyof CritiqueResult["scores"], string> = {
  identity: "Identidade",
  realism: "Realismo",
  hierarchy: "Hierarquia",
  typography: "Tipografia",
  brief: "Aderência",
};

export function CenterPreview() {
  const {
    state,
    generating,
    setGenerating,
    pushGeneration,
    generationError,
    setGenerationError,
  } = useEditor();
  const [latestImage, setLatestImage] = useState<string | null>(null);
  const [critique, setCritique] = useState<CritiqueResult | null>(null);
  const [critiqueLoading, setCritiqueLoading] = useState(false);
  const [critiqueError, setCritiqueError] = useState<string | null>(null);

  // Reset critique whenever the image changes — old scores would be stale.
  useEffect(() => {
    setCritique(null);
    setCritiqueError(null);
  }, [latestImage]);

  async function handleCritique() {
    if (!latestImage) return;
    setCritiqueLoading(true);
    setCritiqueError(null);
    try {
      const res = await fetch("/api/critique", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: latestImage,
          imageMime: "image/png",
          briefing: {
            niche: state.niche,
            mode: state.mode,
            creativeNote: state.creativeNote,
            headline: state.copy.headline,
            subheadline: state.copy.subheadline,
            cta: state.copy.cta,
            hasSubject: state.subject.photos.length > 0,
          },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as CritiqueResult;
      setCritique(data);
    } catch (err) {
      setCritiqueError((err as Error).message);
    } finally {
      setCritiqueLoading(false);
    }
  }

  useEffect(() => {
    if (state.style.fontFamily) loadFont(state.style.fontFamily);
  }, [state.style.fontFamily]);

  async function handleGenerate() {
    setGenerationError(null);
    setGenerating(true);
    try {
      const payload = toApiPayload(state);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload,
          subjectImages: state.subject.photos.map((p) => ({
            base64: p.photoBase64,
            mimeType: p.photoMime,
          })),
          referenceImages: state.references.map((r) => ({
            base64: r.imageBase64,
            mimeType: r.mimeType,
            note: r.note,
          })),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { imageUrl: string };
      setLatestImage(data.imageUrl);
      pushGeneration({
        id: `gen-${Date.now()}`,
        createdAt: Date.now(),
        imageUrl: data.imageUrl,
        state,
      });
    } catch (err) {
      setGenerationError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  const aspect = ASPECT[state.style.dimensions];
  const dims =
    state.style.dimensions === "9:16"
      ? { w: 360, h: 640 }
      : state.style.dimensions === "4:5"
        ? { w: 480, h: 600 }
        : state.style.dimensions === "16:9"
          ? { w: 720, h: 405 }
          : { w: 540, h: 540 };

  // Pre-flight checklist — visible signal of what's filled vs missing.
  const checklist = [
    { label: "Sujeito", ok: state.subject.photos.length > 0 },
    { label: "Nicho", ok: state.niche.trim().length > 0 },
    { label: "Paleta", ok: state.style.colorPalette.length >= 2 },
    { label: "Direção", ok: state.creativeNote.trim().length > 0 },
    {
      label: "Copy",
      ok:
        state.copy.headline.trim().length > 0 ||
        state.copy.subheadline.trim().length > 0 ||
        state.copy.cta.trim().length > 0,
    },
  ];
  const okCount = checklist.filter((c) => c.ok).length;
  const checklistColor =
    okCount >= 4
      ? "text-edis-mint"
      : okCount >= 2
        ? "text-amber-400"
        : "text-edis-text-3";

  return (
    <section className="flex h-full flex-1 flex-col bg-background">
      <header className="flex items-center justify-between gap-3 border-b border-edis-line-1 px-6 py-3">
        <div
          className="flex items-center gap-2"
          title={`Brief: ${okCount} de ${checklist.length} preenchidos`}
        >
          <span className={cn("font-mono text-[10.5px] uppercase tracking-[0.14em]", checklistColor)}>
            Brief · {okCount}/{checklist.length}
          </span>
          <div className="flex items-center gap-1">
            {checklist.map((c) => (
              <span
                key={c.label}
                title={`${c.label} ${c.ok ? "✓" : "·  vazio"}`}
                className={cn(
                  "h-1.5 w-4 rounded-full transition-colors",
                  c.ok ? "bg-edis-mint" : "bg-edis-line-2"
                )}
              />
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-[#33eb8c] disabled:opacity-60"
        >
          <Icon icon={MagicWand01Icon} size={14} strokeWidth={2} />
          {generating ? "Gerando…" : "Gerar Criativo"}
        </button>
      </header>

      <div className="flex flex-1 items-center justify-center overflow-auto p-6">
        <div className="flex flex-col items-center gap-3">
          <div
            className="relative grid place-items-center overflow-hidden rounded-lg border border-edis-line-2 bg-edis-ink-1"
            style={{ width: dims.w, height: dims.h, aspectRatio: aspect }}
          >
            {/* Generating takes priority over the existing image — when the
                user re-generates, we show the loading state instead of the
                previous result so it's clear something new is in flight. */}
            {generating ? (
              <div className="edis-raven-loop relative grid place-items-center">
                <EdisLogo variant="mark" size={Math.min(dims.w, dims.h) * 0.18} />
              </div>
            ) : latestImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={latestImage}
                alt="generated creative"
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <div className="group/edis-logo relative grid place-items-center">
                <EdisLogo variant="mark" size={Math.min(dims.w, dims.h) * 0.18} />
              </div>
            )}
          </div>

          {latestImage && (
            <>
              <div className="flex items-center gap-2">
                <a
                  href={latestImage}
                  download={`edis-criativo-${Date.now()}.png`}
                  className="flex items-center gap-1.5 rounded-md border border-edis-line-2 bg-edis-ink-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-edis-text-3 hover:bg-edis-ink-3 hover:text-foreground"
                >
                  <Icon icon={Download01Icon} size={12} />
                  Baixar PNG
                </a>
                <SaveToDriveDialog
                  imageUrl={latestImage}
                  defaultFileName={`edis-criativo-${Date.now()}.png`}
                  trigger={
                    <button
                      type="button"
                      className="flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-primary hover:bg-primary/15"
                    >
                      <Icon icon={CloudUploadIcon} size={12} />
                      Salvar no Drive
                    </button>
                  }
                />
                <button
                  type="button"
                  onClick={handleCritique}
                  disabled={critiqueLoading}
                  className="flex items-center gap-1.5 rounded-md border border-edis-line-2 bg-edis-ink-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-edis-text-3 hover:bg-edis-ink-3 hover:text-foreground disabled:opacity-60"
                >
                  <Icon icon={StarIcon} size={12} />
                  {critiqueLoading ? "Avaliando…" : critique ? "Re-avaliar" : "Avaliar"}
                </button>
              </div>

              {critiqueError && (
                <p className="max-w-[480px] rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-[12.5px] text-red-400">
                  {critiqueError}
                </p>
              )}

              {critique && <CritiqueCard result={critique} />}
            </>
          )}

          {generationError && (
            <p className="max-w-[480px] rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-[12.5px] text-red-400">
              {generationError}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function CritiqueCard({ result }: { result: CritiqueResult }) {
  const avg =
    Object.values(result.scores).reduce((a, b) => a + b, 0) /
    Object.values(result.scores).length;

  return (
    <div className="w-full max-w-[640px] rounded-xl border border-edis-line-1 bg-edis-ink-1 p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon icon={StarIcon} size={14} className="text-edis-mint" />
          <span className="font-display text-[14px] font-medium text-foreground">
            Avaliação
          </span>
        </div>
        <span className="font-mono text-[11px] text-edis-text-3">
          Média{" "}
          <span className={cn("font-medium", scoreColor(avg))}>
            {avg.toFixed(1)}
          </span>
          /10
        </span>
      </div>

      {/* Scores */}
      <div className="mb-4 grid grid-cols-5 gap-2">
        {(Object.keys(result.scores) as Array<keyof CritiqueResult["scores"]>).map(
          (key) => (
            <ScoreCell
              key={key}
              label={CRITIQUE_LABELS[key]}
              value={result.scores[key]}
            />
          )
        )}
      </div>

      {/* Verdict */}
      <p className="mb-4 rounded-md border border-edis-line-2 bg-edis-ink-2 px-3 py-2 text-[12.5px] leading-snug text-edis-text-2">
        {result.verdict}
      </p>

      {/* Lists */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <CritiqueList
          icon={Tick01Icon}
          color="text-edis-mint"
          label="Manter"
          items={result.keep}
        />
        <CritiqueList
          icon={AlertCircleIcon}
          color="text-amber-400"
          label="Corrigir"
          items={result.fix}
        />
        <CritiqueList
          icon={Idea01Icon}
          color="text-edis-text-2"
          label="Quick wins"
          items={result.quickWins}
        />
      </div>
    </div>
  );
}

function ScoreCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-md border border-edis-line-2 bg-edis-ink-2 px-2 py-2 text-center">
      <span className={cn("font-display text-[18px] font-medium leading-none", scoreColor(value))}>
        {value}
      </span>
      <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-edis-text-4">
        {label}
      </span>
    </div>
  );
}

function CritiqueList({
  icon,
  color,
  label,
  items,
}: {
  icon: typeof StarIcon;
  color: string;
  label: string;
  items: string[];
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border border-edis-line-2 bg-edis-ink-2 p-2.5 opacity-50">
        <div className="mb-1 flex items-center gap-1.5">
          <Icon icon={icon} size={11} className={color} />
          <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-edis-text-4">
            {label}
          </span>
        </div>
        <p className="text-[11px] italic text-edis-text-4">vazio</p>
      </div>
    );
  }
  return (
    <div className="rounded-md border border-edis-line-2 bg-edis-ink-2 p-2.5">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Icon icon={icon} size={11} className={color} />
        <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-edis-text-4">
          {label}
        </span>
      </div>
      <ul className="flex flex-col gap-1">
        {items.map((it, i) => (
          <li key={i} className="text-[11.5px] leading-snug text-edis-text-2">
            · {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function scoreColor(value: number): string {
  if (value >= 8) return "text-edis-mint";
  if (value >= 5) return "text-amber-400";
  return "text-red-400";
}
