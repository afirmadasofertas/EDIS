"use client";

import { useEffect, useState } from "react";
import { Download01Icon, MagicWand01Icon } from "@hugeicons/core-free-icons";

import { Icon } from "@/components/icon";
import { EdisLogo } from "@/components/layout/edis-logo";
import { useEditor } from "./_state";
import { loadFont } from "./_fonts";
import { toApiPayload, type Dimensions } from "./_types";

const ASPECT: Record<Dimensions, string> = {
  "9:16": "9 / 16",
  "4:5": "4 / 5",
  "16:9": "16 / 9",
  "1:1": "1 / 1",
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

  useEffect(() => {
    loadFont(state.style.fontFamily);
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

  return (
    <section className="flex h-full flex-1 flex-col bg-background">
      <header className="flex items-center justify-end border-b border-edis-line-1 px-6 py-3">
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
            className="relative grid place-items-center overflow-hidden rounded-lg border border-edis-line-2 bg-edis-ink-1 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]"
            style={{ width: dims.w, height: dims.h, aspectRatio: aspect }}
          >
            {latestImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={latestImage}
                alt="generated creative"
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <div
                className={
                  generating
                    ? "edis-raven-loop relative grid place-items-center"
                    : "group/edis-logo relative grid place-items-center"
                }
              >
                {generating && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -m-8 animate-pulse rounded-full bg-edis-mint/20 blur-2xl"
                  />
                )}
                <EdisLogo variant="mark" size={Math.min(dims.w, dims.h) * 0.18} />
              </div>
            )}
          </div>

          {latestImage && (
            <a
              href={latestImage}
              download={`edis-criativo-${Date.now()}.png`}
              className="flex items-center gap-1.5 rounded-md border border-edis-line-2 bg-edis-ink-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-edis-text-3 hover:bg-edis-ink-3 hover:text-foreground"
            >
              <Icon icon={Download01Icon} size={12} />
              Baixar PNG
            </a>
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
