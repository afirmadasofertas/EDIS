"use client";

import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

import { Icon } from "@/components/icon";

// Inline popover color picker. Stays open while user drags the saturation
// square / hue slider — only closes on outside click or X.

export function ColorSwatch({
  color,
  onChange,
  onRemove,
}: {
  color: string;
  onChange: (next: string) => void;
  onRemove?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <div className="flex h-7 items-center gap-1 rounded-md border border-edis-line-2 bg-edis-ink-2 pl-1 pr-1">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="size-5 rounded-sm border border-edis-line-3"
          style={{ backgroundColor: color }}
          aria-label="Edit color"
        />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="font-mono text-[10px] uppercase text-edis-text-3 hover:text-foreground"
        >
          {color.replace("#", "")}
        </button>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove color"
            className="ml-0.5 rounded p-0.5 text-edis-text-4 hover:bg-edis-ink-3 hover:text-foreground"
          >
            <Icon icon={Cancel01Icon} size={11} />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1.5 rounded-md border border-edis-line-2 bg-edis-ink-1 p-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]">
          <HexColorPicker
            color={color}
            onChange={onChange}
            style={{ width: 200, height: 160 }}
          />
          <div className="mt-2 flex items-center gap-1.5">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-edis-text-4">
              HEX
            </span>
            <input
              value={color.toUpperCase()}
              onChange={(e) => {
                const v = e.target.value.trim();
                if (/^#?[0-9a-fA-F]{0,6}$/.test(v)) {
                  onChange(v.startsWith("#") ? v : `#${v}`);
                }
              }}
              className="h-7 flex-1 rounded border border-edis-line-2 bg-edis-ink-2 px-2 font-mono text-[11.5px] uppercase text-foreground focus:border-edis-mint focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
