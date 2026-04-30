"use client";

import { Cancel01Icon, Download01Icon } from "@hugeicons/core-free-icons";

import { Icon } from "@/components/icon";
import { useEditor } from "./_state";

export function GalleryPanel() {
  const { generations, removeGeneration } = useEditor();

  return (
    <aside className="hidden h-full w-[280px] shrink-0 flex-col border-l border-edis-line-1 bg-edis-ink-1 xl:flex">
      <div className="flex items-center justify-between border-b border-edis-line-1 px-4 py-3">
        <span className="edis-tag">Histórico</span>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-edis-text-4">
          {generations.length}
        </span>
      </div>

      {generations.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
          <div className="size-10 rounded-md border border-dashed border-edis-line-2" />
          <p className="text-[12.5px] text-edis-text-3">
            Suas gerações aparecerão aqui.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-edis-text-4">
            Sem histórico ainda
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-2 gap-2">
            {generations.map((g) => (
              <div
                key={g.id}
                className="group relative overflow-hidden rounded-md border border-edis-line-2 bg-edis-ink-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.imageUrl}
                  alt="generated"
                  className="aspect-[4/5] w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/80 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <a
                    href={g.imageUrl}
                    download={`edis-${g.id}.png`}
                    aria-label="Download"
                    className="grid size-6 place-items-center rounded bg-white/90 text-black hover:bg-white"
                  >
                    <Icon icon={Download01Icon} size={11} strokeWidth={2} />
                  </a>
                  <button
                    type="button"
                    onClick={() => removeGeneration(g.id)}
                    aria-label="Remove"
                    className="grid size-6 place-items-center rounded bg-black/60 text-white hover:bg-black/80"
                  >
                    <Icon icon={Cancel01Icon} size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
