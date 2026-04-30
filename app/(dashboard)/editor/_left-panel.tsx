"use client";

import { useEffect, useRef, useState } from "react";
import {
  Add01Icon,
  AlignBottomIcon,
  AlignHorizontalCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  AlignTopIcon,
  AlignVerticalCenterIcon,
  Cancel01Icon,
  CropIcon,
  Edit03Icon,
  Image02Icon,
  Note03Icon,
  PaintBrush01Icon,
  Sun01Icon,
  TextAlignCenterIcon,
  TextAlignLeft01Icon,
  TextAlignRight01Icon,
  TextFontIcon,
  UserIcon,
  AspectRatioIcon,
  MagicWand01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Icon } from "@/components/icon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { fileToBase64, useEditor } from "./_state";
import { FontPicker } from "./_font-picker";
import { loadFont } from "./_fonts";
import { ColorSwatch } from "./_color-picker";
import type {
  Alignment,
  Dimensions,
  Framing,
  Lighting,
  Position,
  VerticalAlignment,
  VisualStyle,
} from "./_types";

type IconOpt<T extends string | number> = { id: T; label: string; icon: IconSvgElement };
type LabelOpt<T extends string | number> = { id: T; label: string };

const LIGHTING_PRESETS: { id: Lighting; label: string; swatch: string[] }[] = [
  { id: "cold", label: "Fria", swatch: ["#0b1d3a", "#7eb6ff"] },
  { id: "warm", label: "Quente", swatch: ["#3a1d0b", "#ff9b54"] },
  { id: "neutral", label: "Neutra", swatch: ["#2a2a2a", "#d8d8d8"] },
  { id: "dark", label: "Dark", swatch: ["#000000", "#222222"] },
  { id: "vibrant", label: "Vibrante", swatch: ["#ff006e", "#00e573"] },
];

const STYLES: LabelOpt<VisualStyle>[] = [
  { id: "minimalist", label: "Minimal" },
  { id: "bold", label: "Bold" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "corporate", label: "Corporate" },
];

const DIMENSIONS: { id: Dimensions; label: string; sub: string; w: number; h: number }[] = [
  { id: "9:16", label: "Stories", sub: "9:16", w: 9, h: 16 },
  { id: "4:5", label: "Feed", sub: "4:5", w: 12, h: 15 },
  { id: "16:9", label: "Land", sub: "16:9", w: 16, h: 9 },
  { id: "1:1", label: "Square", sub: "1:1", w: 14, h: 14 },
];

const FRAMINGS: LabelOpt<Framing>[] = [
  { id: "close-up", label: "Close" },
  { id: "medium", label: "Médio" },
  { id: "wide", label: "Aberto" },
];

const POSITIONS: IconOpt<Position>[] = [
  { id: "left", label: "Esquerda", icon: AlignLeftIcon },
  { id: "center", label: "Centro", icon: AlignHorizontalCenterIcon },
  { id: "right", label: "Direita", icon: AlignRightIcon },
];

const TEXT_ALIGN: IconOpt<Alignment>[] = [
  { id: "left", label: "Esquerda", icon: TextAlignLeft01Icon },
  { id: "center", label: "Centro", icon: TextAlignCenterIcon },
  { id: "right", label: "Direita", icon: TextAlignRight01Icon },
];

const TEXT_VERTICAL: IconOpt<VerticalAlignment>[] = [
  { id: "top", label: "Superior", icon: AlignTopIcon },
  { id: "middle", label: "Meio", icon: AlignVerticalCenterIcon },
  { id: "bottom", label: "Inferior", icon: AlignBottomIcon },
];

export function LeftPanel() {
  const {
    state,
    patch,
    addReference,
    updateReferenceNote,
    removeReference,
    addSubjectPhoto,
    removeSubjectPhoto,
  } = useEditor();
  const subjectFileRef = useRef<HTMLInputElement>(null);
  const refsFileRef = useRef<HTMLInputElement>(null);
  const [noteOpen, setNoteOpen] = useState(true);
  const [copySuggestions, setCopySuggestions] = useState<{
    headlines: string[];
    subheadlines: string[];
    ctas: string[];
  } | null>(null);
  const [copyLoading, setCopyLoading] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  async function handleSuggestCopy() {
    setCopyLoading(true);
    setCopyError(null);
    try {
      const res = await fetch("/api/suggest-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: state.niche,
          mode: state.mode,
          visualStyle: state.style.visualStyle,
          creativeNote: state.creativeNote,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setCopySuggestions(data);
    } catch (err) {
      setCopyError((err as Error).message);
    } finally {
      setCopyLoading(false);
    }
  }

  async function handleSubjectUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) {
      if (state.subject.photos.length >= 5) break;
      const { base64, dataUrl, mimeType } = await fileToBase64(file);
      addSubjectPhoto({ photoUrl: dataUrl, photoBase64: base64, photoMime: mimeType });
    }
    e.target.value = "";
  }

  async function handleRefsUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) {
      if (state.references.length >= 5) break;
      const { base64, dataUrl, mimeType } = await fileToBase64(file);
      addReference({ imageUrl: dataUrl, imageBase64: base64, mimeType, note: "" });
    }
    e.target.value = "";
  }

  return (
    <aside className="flex h-full w-[320px] shrink-0 flex-col border-r border-edis-line-1 bg-edis-ink-1">
      <div className="flex items-center justify-between border-b border-edis-line-1 px-4 py-3">
        <span className="font-display text-[14px] font-medium tracking-tight text-foreground">
          Editor
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-edis-text-4">
          {state.style.dimensions}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <section className="flex flex-col gap-1.5 border-b border-edis-line-1 px-4 py-3">
          <DirectionCard
            active={state.mode === "editorial"}
            label="Editorial"
            mood="Foto premium magazine. Sujeito hero, fundo desfocado, color grade restrained, naturalístico."
            palette={["#0a0a0a", "#fafafa", "#a08060", "#7a7a7a", "#d4af37"]}
            displayFont="Playfair Display"
            bodyFont="Inter"
            refs={["Vogue", "Monocle", "Vanity Fair"]}
            onClick={() => patch("mode", "editorial" as never)}
          />
          <DirectionCard
            active={state.mode === "campaign"}
            label="Campanha"
            mood="Poster cinematográfico, CGI integrado, theatrical lighting, color grade pesado, impacto."
            palette={["#0a0a0a", "#7c3aed", "#f59e0b", "#22d3ee", "#ec4899"]}
            displayFont="Bricolage Grotesque"
            bodyFont="Manrope"
            refs={["Design Builder", "GolBet", "Movie posters"]}
            onClick={() => patch("mode", "campaign" as never)}
          />
        </section>

        <Section icon={Edit03Icon} label="Nicho">
          <Input
            value={state.niche}
            onChange={(e) => patch("niche", e.target.value as never)}
            placeholder="Curso online, e-commerce…"
            className="h-9 border-edis-line-2 bg-edis-ink-2 text-[13px]"
          />
        </Section>

        <Section
          icon={UserIcon}
          label={`Sujeito (${state.subject.photos.length}/5)`}
        >
          {state.subject.photos.length === 0 ? (
            <button
              type="button"
              onClick={() => subjectFileRef.current?.click()}
              className="flex w-full items-center gap-3 rounded-md border border-dashed border-edis-line-2 bg-edis-ink-2 p-2.5 transition-colors hover:border-edis-mint/50 hover:bg-edis-ink-3"
            >
              <div className="flex size-11 items-center justify-center rounded bg-edis-ink-3 text-edis-text-4">
                <Icon icon={Add01Icon} size={16} />
              </div>
              <div className="flex-1 text-left">
                <div className="text-[12.5px] font-medium text-foreground">
                  Upload das fotos
                </div>
                <div className="font-mono text-[10px] text-edis-text-4">
                  Até 5 imagens · JPG · PNG · WebP
                </div>
              </div>
            </button>
          ) : (
            <div className="grid grid-cols-4 gap-1.5">
              {state.subject.photos.map((p) => (
                <div
                  key={p.id}
                  className="group relative aspect-square overflow-hidden rounded-md border border-edis-line-2 bg-edis-ink-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.photoUrl}
                    alt="subject"
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeSubjectPhoto(p.id)}
                    aria-label="Remove"
                    className="absolute right-1 top-1 grid size-5 place-items-center rounded bg-black/70 text-white opacity-0 transition-opacity hover:bg-black/90 group-hover:opacity-100"
                  >
                    <Icon icon={Cancel01Icon} size={11} />
                  </button>
                </div>
              ))}
              {state.subject.photos.length < 5 && (
                <button
                  type="button"
                  onClick={() => subjectFileRef.current?.click()}
                  className="flex aspect-square items-center justify-center rounded-md border border-dashed border-edis-line-2 bg-edis-ink-2 text-edis-text-4 transition-colors hover:border-edis-mint/50 hover:text-foreground"
                  aria-label="Adicionar foto"
                >
                  <Icon icon={Add01Icon} size={16} />
                </button>
              )}
            </div>
          )}
          <input
            ref={subjectFileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleSubjectUpload}
          />

        </Section>

        <Section icon={CropIcon} label="Composição">
          <div className="grid grid-cols-3 gap-1.5">
            {POSITIONS.map((p) => (
              <IconButton
                key={p.id}
                active={state.subject.position === p.id}
                icon={p.icon}
                title={`Sujeito · ${p.label}`}
                onClick={() => patch("subject", { position: p.id })}
              />
            ))}
          </div>
          <div className="mt-1.5">
            <ButtonRow
              options={FRAMINGS}
              value={state.subject.framing}
              onChange={(v) => patch("subject", { framing: v })}
            />
          </div>
        </Section>

        <Section icon={Sun01Icon} label="Iluminação">
          <div className="grid grid-cols-5 gap-1.5">
            {LIGHTING_PRESETS.map((p) => {
              const active = state.style.lighting === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  title={p.label}
                  onClick={() => patch("style", { lighting: p.id })}
                  className={cn(
                    "group flex flex-col items-center gap-1 rounded-md border p-1 transition-all",
                    active
                      ? "border-edis-mint bg-edis-mint/5"
                      : "border-edis-line-2 bg-edis-ink-2 hover:border-edis-line-3"
                  )}
                >
                  <div
                    className="h-6 w-full rounded-sm"
                    style={{
                      background: `linear-gradient(135deg, ${p.swatch[0]}, ${p.swatch[1]})`,
                    }}
                  />
                  <span className="font-mono text-[9px] uppercase tracking-[0.06em] text-edis-text-3">
                    {p.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section icon={PaintBrush01Icon} label="Cores · Estilo">
          <div className="flex flex-wrap gap-1.5">
            {state.style.colorPalette.map((color, idx) => (
              <ColorSwatch
                key={`${idx}`}
                color={color}
                onChange={(next) => {
                  const arr = [...state.style.colorPalette];
                  arr[idx] = next;
                  patch("style", { colorPalette: arr });
                }}
                onRemove={() => {
                  const arr = state.style.colorPalette.filter((_, i) => i !== idx);
                  patch("style", { colorPalette: arr });
                }}
              />
            ))}
            {state.style.colorPalette.length < 5 && (
              <button
                type="button"
                onClick={() =>
                  patch("style", {
                    colorPalette: [...state.style.colorPalette, "#ffffff"],
                  })
                }
                className="flex h-7 items-center gap-1 rounded-md border border-dashed border-edis-line-2 bg-edis-ink-2 px-2 text-[11px] text-edis-text-3 hover:border-edis-mint/50 hover:text-foreground"
              >
                <Icon icon={Add01Icon} size={11} />
                Cor
              </button>
            )}
          </div>
          <div className="mt-2.5">
            <ButtonRow
              options={STYLES}
              value={state.style.visualStyle}
              onChange={(v) => patch("style", { visualStyle: v })}
            />
          </div>
        </Section>

        <Section icon={AspectRatioIcon} label="Dimensões">
          <div className="grid grid-cols-4 gap-1.5">
            {DIMENSIONS.map((d) => {
              const active = state.style.dimensions === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => patch("style", { dimensions: d.id })}
                  title={`${d.label} · ${d.sub}`}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-md border px-1.5 py-2 transition-all",
                    active
                      ? "border-edis-mint bg-edis-mint/5"
                      : "border-edis-line-2 bg-edis-ink-2 hover:border-edis-line-3"
                  )}
                >
                  <div
                    className={cn(
                      "border",
                      active ? "border-edis-mint" : "border-edis-text-4"
                    )}
                    style={{ width: d.w, height: d.h }}
                  />
                  <span className="font-mono text-[9px] text-edis-text-4">{d.sub}</span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section icon={TextFontIcon} label="Tipografia">
          <FontPicker
            value={state.style.fontFamily}
            onChange={(family) => patch("style", { fontFamily: family })}
          />
        </Section>

        <Section
          icon={Edit03Icon}
          label="Copy"
          rightSlot={
            <button
              type="button"
              onClick={handleSuggestCopy}
              disabled={copyLoading}
              className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-edis-mint hover:text-foreground disabled:opacity-50"
            >
              <Icon icon={MagicWand01Icon} size={11} />
              {copyLoading ? "Sugerindo…" : "Sugerir"}
            </button>
          }
        >
          {copyError && (
            <p className="rounded-md border border-red-500/20 bg-red-500/10 px-2 py-1.5 text-[11.5px] text-red-400">
              {copyError}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <CopyField
              value={state.copy.headline}
              onChange={(v) => patch("copy", { headline: v })}
              placeholder="Headline"
              suggestions={copySuggestions?.headlines}
            />
            <CopyField
              value={state.copy.subheadline}
              onChange={(v) => patch("copy", { subheadline: v })}
              placeholder="Subheadline"
              suggestions={copySuggestions?.subheadlines}
            />
            <CopyField
              value={state.copy.cta}
              onChange={(v) => patch("copy", { cta: v })}
              placeholder="CTA"
              suggestions={copySuggestions?.ctas}
            />
          </div>

          <div className="mt-2.5 flex flex-col gap-1.5">
            <div className="grid grid-cols-3 gap-1.5">
              {TEXT_ALIGN.map((a) => (
                <IconButton
                  key={a.id}
                  active={state.composition.textAlignment === a.id}
                  icon={a.icon}
                  title={`Horizontal · ${a.label}`}
                  onClick={() => patch("composition", { textAlignment: a.id })}
                />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {TEXT_VERTICAL.map((a) => (
                <IconButton
                  key={a.id}
                  active={state.composition.textVertical === a.id}
                  icon={a.icon}
                  title={`Vertical · ${a.label}`}
                  onClick={() => patch("composition", { textVertical: a.id })}
                />
              ))}
            </div>
          </div>
        </Section>

        <Section
          icon={Note03Icon}
          label="Direção criativa (opcional)"
          rightSlot={
            <button
              type="button"
              onClick={() => setNoteOpen((v) => !v)}
              className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-edis-text-4 hover:text-foreground"
            >
              {noteOpen ? "−" : "+"}
            </button>
          }
        >
          {noteOpen && (
            <Textarea
              value={state.creativeNote}
              onChange={(e) => patch("creativeNote", e.target.value as never)}
              placeholder="Descreva o que você imagina: mood, ambientação, qualquer detalhe que ajude o modelo…"
              className="min-h-[88px] resize-none border-edis-line-2 bg-edis-ink-2 text-[12.5px] leading-snug"
            />
          )}
          {!noteOpen && state.creativeNote && (
            <p className="line-clamp-2 text-[11.5px] text-edis-text-3">
              {state.creativeNote}
            </p>
          )}
        </Section>

        <Section icon={Image02Icon} label={`Referências (${state.references.length}/5)`}>
          <div className="flex flex-col gap-2">
            {state.references.map((ref) => (
              <div
                key={ref.id}
                className="rounded-md border border-edis-line-2 bg-edis-ink-2 p-2"
              >
                <div className="flex items-start gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ref.imageUrl}
                    alt="reference"
                    className="size-12 rounded object-cover"
                  />
                  <Textarea
                    value={ref.note}
                    onChange={(e) => updateReferenceNote(ref.id, e.target.value)}
                    placeholder="Gostei da iluminação, da composição…"
                    className="min-h-[48px] flex-1 resize-none border-edis-line-2 bg-edis-ink-1 text-[11.5px] leading-snug"
                  />
                  <button
                    type="button"
                    onClick={() => removeReference(ref.id)}
                    aria-label="Remove"
                    className="rounded p-1 text-edis-text-4 hover:bg-edis-ink-3 hover:text-foreground"
                  >
                    <Icon icon={Cancel01Icon} size={13} />
                  </button>
                </div>
              </div>
            ))}

            {state.references.length < 5 && (
              <button
                type="button"
                onClick={() => refsFileRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-md border border-dashed border-edis-line-2 bg-edis-ink-2 px-3 py-2.5 text-[12px] text-edis-text-3 hover:border-edis-mint/50 hover:text-foreground"
              >
                <Icon icon={Add01Icon} size={12} />
                Adicionar referência
              </button>
            )}
          </div>
          <input
            ref={refsFileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleRefsUpload}
          />
        </Section>
      </div>
    </aside>
  );
}

function Section({
  icon,
  label,
  rightSlot,
  children,
}: {
  icon: IconSvgElement;
  label: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2 border-b border-edis-line-1 px-4 py-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-edis-text-4">
          <Icon icon={icon} size={12} />
          <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
            {label}
          </span>
        </div>
        {rightSlot}
      </div>
      {children}
    </section>
  );
}

function ButtonRow<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: LabelOpt<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid grid-flow-col auto-cols-fr gap-1.5">
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={String(opt.id)}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "h-8 rounded-md border text-[11.5px] font-medium transition-all",
              active
                ? "border-edis-mint bg-edis-mint/5 text-foreground"
                : "border-edis-line-2 bg-edis-ink-2 text-edis-text-2 hover:border-edis-line-3 hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function IconButton({
  active,
  icon,
  title,
  onClick,
}: {
  active: boolean;
  icon: IconSvgElement;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={cn(
        "flex h-8 items-center justify-center rounded-md border transition-all",
        active
          ? "border-edis-mint bg-edis-mint/5 text-foreground"
          : "border-edis-line-2 bg-edis-ink-2 text-edis-text-2 hover:border-edis-line-3 hover:text-foreground"
      )}
    >
      <Icon icon={icon} size={15} />
    </button>
  );
}

/**
 * Copy input + suggestion pills underneath. When the user runs "Sugerir"
 * the server returns 3 alternatives; we render them as small clickable
 * chips that fill the input.
 */
function CopyField({
  value,
  onChange,
  placeholder,
  suggestions,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  suggestions?: string[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 border-edis-line-2 bg-edis-ink-2 text-[13px]"
      />
      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(s)}
              className="rounded-full border border-edis-mint/30 bg-edis-mint/5 px-2 py-0.5 text-[11px] text-edis-text-2 transition-colors hover:border-edis-mint/60 hover:bg-edis-mint/10 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Rich direction picker card. Shows the user, in one glance, what each mode
 * actually produces — palette swatches, display+body font samples, mood
 * blurb, and real-world references — so they don't have to guess from a
 * 2-word label.
 *
 * Pattern adapted from open-design's QuestionForm DirectionCardView, scoped
 * to our editor's MODE state (editorial vs campaign for now).
 */
function DirectionCard({
  active,
  label,
  mood,
  palette,
  displayFont,
  bodyFont,
  refs,
  onClick,
}: {
  active: boolean;
  label: string;
  mood: string;
  palette: string[];
  displayFont: string;
  bodyFont: string;
  refs: string[];
  onClick: () => void;
}) {
  // Preload the preview fonts so the live samples render in their actual face.
  useEffect(() => {
    loadFont(displayFont);
    loadFont(bodyFont);
  }, [displayFont, bodyFont]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col gap-2 rounded-md border p-3 text-left transition-all",
        active
          ? "border-edis-mint bg-edis-mint/5 shadow-[0_0_0_1px_rgba(0,229,115,0.15)]"
          : "border-edis-line-2 bg-edis-ink-2 hover:border-edis-line-3"
      )}
    >
      {/* Header — label + selected pill */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "text-[12.5px] font-medium",
            active ? "text-foreground" : "text-edis-text-2"
          )}
        >
          {label}
        </span>
        {active && (
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-edis-mint">
            ✓ Selecionado
          </span>
        )}
      </div>

      {/* Palette + type sample row */}
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {palette.slice(0, 5).map((c, i) => (
            <span
              key={i}
              className="size-4 rounded-sm border border-black/30"
              style={{ backgroundColor: c }}
              aria-hidden
            />
          ))}
        </div>
        <span className="ml-auto flex items-baseline gap-1.5">
          <span
            className="text-[18px] leading-none text-foreground"
            style={{ fontFamily: `"${displayFont}", serif` }}
          >
            Aa
          </span>
          <span
            className="text-[10.5px] text-edis-text-3"
            style={{ fontFamily: `"${bodyFont}", sans-serif` }}
          >
            Sample text
          </span>
        </span>
      </div>

      {/* Mood blurb */}
      <p className="line-clamp-2 text-[11px] leading-snug text-edis-text-3">
        {mood}
      </p>

      {/* Refs row */}
      <p className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-edis-text-4">
        Refs · {refs.join(" · ")}
      </p>
    </button>
  );
}

