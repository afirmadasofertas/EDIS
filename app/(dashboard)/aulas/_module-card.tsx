import Link from "next/link";
import { PlayCircleIcon } from "@hugeicons/core-free-icons";

import { Icon } from "@/components/icon";
import { type Module } from "./_data";
import { getModuleLessonCount } from "./_progress";

interface ModuleCardProps {
  module: Module;
}

export function ModuleCard({ module: m }: ModuleCardProps) {
  const lessonCount = getModuleLessonCount(m.id);

  return (
    <Link
      href={`/aulas/${m.id}`}
      className="
        group block rounded-xl outline-none
        focus-visible:ring-2 focus-visible:ring-primary/60
        focus-visible:ring-offset-2 focus-visible:ring-offset-background
      "
    >
      <article
        className="
          flex min-h-[190px] flex-col rounded-xl border border-border bg-card
          transition-colors duration-150
          group-hover:border-edis-line-3
        "
      >
        <div className="flex h-full flex-col gap-4 p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {m.tags.map((t) => (
              <span
                key={t}
                className="rounded-md border border-edis-line-2 bg-edis-ink-2 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-edis-text-3"
              >
                {t}
              </span>
            ))}
            <span className="flex items-center gap-1 rounded-md border border-edis-line-2 bg-edis-ink-2 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-edis-text-3">
              <Icon
                icon={PlayCircleIcon}
                size={10}
                strokeWidth={1.75}
                className="size-[10px]"
              />
              {lessonCount} aulas
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-1.5">
            <h3
              className="
                font-display text-[18px] font-medium leading-[1.2] tracking-tight text-foreground
              "
              style={{ letterSpacing: "-0.015em" }}
            >
              {m.title}
            </h3>
            <p className="text-[13.5px] leading-[1.55] text-edis-text-3">
              {m.description}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
