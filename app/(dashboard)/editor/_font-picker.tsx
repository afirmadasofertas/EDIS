"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown01Icon,
  Search01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { FONTS, loadFont } from "./_fonts";

export function FontPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [custom, setCustom] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Preload visible fonts so the dropdown previews them in their actual face.
  useEffect(() => {
    FONTS.forEach((f) => loadFont(f.family));
  }, []);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FONTS;
    return FONTS.filter((f) => f.family.toLowerCase().includes(q));
  }, [query]);

  function pick(family: string) {
    loadFont(family);
    onChange(family);
    setOpen(false);
    setQuery("");
  }

  function applyCustom() {
    const next = custom.trim();
    if (!next) return;
    loadFont(next);
    onChange(next);
    setCustom("");
    setOpen(false);
  }

  const isAuto = !value;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-edis-line-2 bg-edis-ink-2 px-2.5 text-left transition-colors hover:border-edis-line-3"
      >
        <span
          className={cn(
            "truncate text-[13px]",
            isAuto ? "text-edis-text-4" : "text-foreground"
          )}
          style={
            isAuto ? undefined : { fontFamily: `"${value}", system-ui, sans-serif` }
          }
        >
          {isAuto ? "Automática (modelo escolhe)" : value}
        </span>
        <Icon icon={ArrowDown01Icon} size={13} className="shrink-0 text-edis-text-4" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-md border border-edis-line-2 bg-edis-ink-1 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-2 border-b border-edis-line-1 px-2.5 py-2">
            <Icon icon={Search01Icon} size={13} className="text-edis-text-4" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar fonte…"
              className="h-6 flex-1 bg-transparent text-[12.5px] text-foreground placeholder:text-edis-text-4 focus:outline-none"
            />
          </div>

          <div className="max-h-[280px] overflow-y-auto py-1">
            {/* "Automática" option — clears the explicit choice and lets the
                model pick a font that fits the mode + niche. Always visible,
                ignores the search filter. */}
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
                setQuery("");
              }}
              className={cn(
                "flex w-full items-center justify-between gap-2 border-b border-edis-line-1 px-2.5 py-1.5 text-left transition-colors",
                isAuto ? "bg-edis-mint/10" : "hover:bg-edis-ink-2"
              )}
            >
              <span className="text-[13px] text-foreground">
                Automática
              </span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-edis-text-4">
                  modelo escolhe
                </span>
                {isAuto && (
                  <Icon icon={Tick01Icon} size={12} className="text-edis-mint" />
                )}
              </span>
            </button>

            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-[12px] text-edis-text-4">
                Nenhuma fonte. Tente o campo &quot;Custom&quot; abaixo.
              </div>
            ) : (
              filtered.map((f) => {
                const active = f.family === value;
                return (
                  <button
                    key={f.family}
                    type="button"
                    onClick={() => pick(f.family)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left transition-colors",
                      active ? "bg-edis-mint/10" : "hover:bg-edis-ink-2"
                    )}
                  >
                    <span
                      className="truncate text-[14px] text-foreground"
                      style={{ fontFamily: `"${f.family}", system-ui, sans-serif` }}
                    >
                      {f.family}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-edis-text-4">
                        {f.category}
                      </span>
                      {active && (
                        <Icon icon={Tick01Icon} size={12} className="text-edis-mint" />
                      )}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-edis-line-1 p-2">
            <div className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-edis-text-4">
              Custom · qualquer Google Font
            </div>
            <div className="flex items-center gap-1.5">
              <input
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyCustom();
                  }
                }}
                placeholder="ex: Krona One"
                className="h-7 flex-1 rounded border border-edis-line-2 bg-edis-ink-2 px-2 text-[12px] text-foreground placeholder:text-edis-text-4 focus:border-edis-mint focus:outline-none"
              />
              <button
                type="button"
                onClick={applyCustom}
                disabled={!custom.trim()}
                className="rounded border border-edis-line-2 bg-edis-ink-2 px-2 text-[11px] font-medium text-edis-text-2 hover:border-edis-mint hover:text-foreground disabled:opacity-40"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
