"use client";

import { useState } from "react";
import {
  Atom02Icon,
  Copy01Icon,
  MagicWand01Icon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

type CrowAIResponse = {
  hooks: { angle: string; line: string }[];
  headlines: string[];
  bodyCopy: string;
  ctas: string[];
  oneLiner: string;
};

const TONES = [
  { id: "hard-sell", label: "Hard-sell" },
  { id: "informativo", label: "Informativo" },
  { id: "humor", label: "Humor" },
  { id: "premium", label: "Premium" },
] as const;

type Tone = (typeof TONES)[number]["id"];

export default function CrowAIPage() {
  const [niche, setNiche] = useState("");
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [tone, setTone] = useState<Tone | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CrowAIResponse | null>(null);

  const canSubmit =
    niche.trim().length > 0 && product.trim().length > 0 && !submitting;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/crowai-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: niche.trim(),
          product: product.trim(),
          audience: audience.trim() || undefined,
          goal: goal.trim() || undefined,
          tone: tone ?? undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as CrowAIResponse;
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <header className="flex flex-col gap-1.5">
        <span className="edis-tag">CrowAI</span>
        <h1
          className="font-display text-[30px] font-medium leading-[1.1] tracking-tight text-foreground"
          style={{ letterSpacing: "-0.025em" }}
        >
          Copywriter direct response.
        </h1>
        <p className="max-w-xl text-[14px] leading-[1.55] text-edis-text-3">
          Hooks, headlines, body e CTAs no estilo black brasileiro — sem cara
          de IA, sem clichê, com voz própria.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl border border-edis-line-1 bg-edis-ink-1 p-5"
        >
          <Field label="Nicho" required>
            <Input
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Curso de Python, e-commerce de moda…"
              required
              className="h-9 border-edis-line-2 bg-edis-ink-2 text-[13px]"
            />
          </Field>

          <Field label="Produto / serviço" required>
            <Textarea
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="Descreve o que vende, em 1-3 linhas. Ex: Curso de 8 semanas que ensina Python pra automação. R$ 497 à vista. Inclui suporte por WhatsApp e portfólio."
              rows={4}
              required
              className="min-h-[88px] resize-y border-edis-line-2 bg-edis-ink-2 text-[13px]"
            />
          </Field>

          <Field label="Persona-alvo" optional>
            <Input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Dev junior frustrado com freela barato"
              className="h-9 border-edis-line-2 bg-edis-ink-2 text-[13px]"
            />
          </Field>

          <Field label="Objetivo da copy" optional>
            <Input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Vender · Capturar lead · Agendar call"
              className="h-9 border-edis-line-2 bg-edis-ink-2 text-[13px]"
            />
          </Field>

          <Field label="Tom" optional>
            <div className="grid grid-cols-2 gap-1.5">
              {TONES.map((t) => {
                const active = tone === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(active ? null : t.id)}
                    className={cn(
                      "h-8 rounded-md border text-[12px] font-medium transition-all",
                      active
                        ? "border-edis-mint bg-edis-mint/5 text-foreground"
                        : "border-edis-line-2 bg-edis-ink-2 text-edis-text-2 hover:border-edis-line-3 hover:text-foreground"
                    )}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </Field>

          {error && (
            <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-[12.5px] text-red-400">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={!canSubmit}
            className="mt-2 h-10 gap-2 bg-primary text-[13px] font-medium text-primary-foreground hover:bg-[#33eb8c] disabled:opacity-50"
          >
            <Icon icon={MagicWand01Icon} size={14} strokeWidth={2} />
            {submitting ? "Gerando…" : "Gerar copy"}
          </Button>
        </form>

        <div className="flex flex-col gap-4">
          {!result && !submitting && <EmptyState />}
          {submitting && <LoadingState />}
          {result && (
            <>
              <Block icon={Atom02Icon} title="One-liner">
                <CopyableLine text={result.oneLiner} onCopy={copy} large />
              </Block>

              <Block title="Hooks (5 ângulos)">
                <div className="flex flex-col gap-2">
                  {result.hooks.map((h, i) => (
                    <div
                      key={i}
                      className="group flex items-start gap-3 rounded-md border border-edis-line-2 bg-edis-ink-2 px-3 py-2.5"
                    >
                      <span className="mt-0.5 shrink-0 rounded border border-edis-mint/30 bg-edis-mint/10 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-edis-mint">
                        {h.angle}
                      </span>
                      <p className="flex-1 text-[13px] leading-[1.5] text-foreground">
                        {h.line}
                      </p>
                      <button
                        type="button"
                        onClick={() => copy(h.line)}
                        aria-label="Copiar"
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Icon
                          icon={Copy01Icon}
                          size={13}
                          className="text-edis-text-4 hover:text-foreground"
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </Block>

              <Block title="Headlines">
                <div className="flex flex-col gap-1.5">
                  {result.headlines.map((h, i) => (
                    <CopyableLine key={i} text={h} onCopy={copy} />
                  ))}
                </div>
              </Block>

              <Block title="Body copy (PAS)">
                <div className="group relative rounded-md border border-edis-line-2 bg-edis-ink-2 p-4">
                  <pre className="whitespace-pre-wrap font-sans text-[13px] leading-[1.6] text-edis-text-2">
                    {result.bodyCopy}
                  </pre>
                  <button
                    type="button"
                    onClick={() => copy(result.bodyCopy)}
                    aria-label="Copiar body"
                    className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Icon
                      icon={Copy01Icon}
                      size={14}
                      className="text-edis-text-4 hover:text-foreground"
                    />
                  </button>
                </div>
              </Block>

              <Block title="CTAs">
                <div className="flex flex-wrap gap-1.5">
                  {result.ctas.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => copy(c)}
                      className="rounded-full border border-edis-mint/30 bg-edis-mint/5 px-3 py-1.5 text-[12.5px] text-edis-text-2 transition-colors hover:border-edis-mint/60 hover:bg-edis-mint/10 hover:text-foreground"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </Block>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  optional,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-edis-text-4">
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

function Block({
  icon,
  title,
  children,
}: {
  icon?: typeof Atom02Icon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-edis-text-4">
        {icon && <Icon icon={icon} size={12} />}
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em]">
          {title}
        </span>
      </div>
      {children}
    </section>
  );
}

function CopyableLine({
  text,
  onCopy,
  large = false,
}: {
  text: string;
  onCopy: (t: string) => void;
  large?: boolean;
}) {
  return (
    <div className="group flex items-start gap-3 rounded-md border border-edis-line-2 bg-edis-ink-2 px-3 py-2.5">
      <p
        className={cn(
          "flex-1 leading-[1.5] text-foreground",
          large ? "text-[16px] font-medium" : "text-[13px]"
        )}
      >
        {text}
      </p>
      <button
        type="button"
        onClick={() => onCopy(text)}
        aria-label="Copiar"
        className="opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Icon
          icon={Copy01Icon}
          size={13}
          className="text-edis-text-4 hover:text-foreground"
        />
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-edis-line-2 bg-edis-ink-1 p-10 text-center">
      <Icon icon={Atom02Icon} size={28} className="text-edis-text-3" />
      <span className="edis-tag">Pronto pra escrever</span>
      <p className="max-w-sm text-[13px] text-edis-text-3">
        Preenche nicho + produto e o CrowAI devolve hooks de 5 ângulos,
        headlines, body completo e CTAs.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-xl border border-edis-line-2 bg-edis-ink-1 p-10 text-center">
      <div className="size-8 animate-spin rounded-full border-2 border-edis-mint border-t-transparent" />
      <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-edis-text-4">
        Pesquisando ângulos…
      </p>
    </div>
  );
}
