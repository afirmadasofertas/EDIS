"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PlayCircleIcon,
  Clock02Icon,
  SignalIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import {
  formatDuration,
  thumbUrl,
  type Module,
} from "./_data";
import {
  getModuleLessonCount,
  getModuleProgress,
  getModuleTotalDuration,
} from "./_progress";

interface ModuleCardProps {
  module: Module;
}

export function ModuleCard({ module: m }: ModuleCardProps) {
  const [progress, setProgress] = useState({
    completed: 0,
    total: 0,
    percent: 0,
  });
  const totalDuration = getModuleTotalDuration(m.id);
  const lessonCount = getModuleLessonCount(m.id);

  // Progress lives in localStorage, which only exists on the client. Hydrate
  // after mount so the card starts at 0 and flips to the persisted value —
  // avoids hydration-mismatch warnings.
  useEffect(() => {
    setProgress(getModuleProgress(m.id));
  }, [m.id]);

  const started = progress.completed > 0;
  const finished = progress.total > 0 && progress.completed === progress.total;

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
          flex flex-col overflow-hidden rounded-xl border border-border bg-card
          transition-colors duration-150
          group-hover:border-edis-line-3
        "
      >
        {/* Thumbnail */}
        <div className="relative overflow-hidden">
          <Image
            src={thumbUrl(m.thumbnailSeed)}
            alt={m.title}
            width={640}
            height={360}
            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
            className="aspect-[16/9] h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Top-left: level badge */}
          <span
            className="
              absolute left-3 top-3 flex items-center gap-1
              rounded-md border border-white/15 bg-black/55 px-2 py-0.5
              font-mono text-[10px] uppercase tracking-[0.14em] text-white/90
              backdrop-blur-sm
            "
          >
            <Icon
              icon={SignalIcon}
              size={10}
              strokeWidth={1.75}
              className="size-[10px]"
            />
            {m.level}
          </span>

          {/* Top-right: finished check OR lesson count */}
          {finished ? (
            <span
              className="
                absolute right-3 top-3 flex items-center gap-1
                rounded-md border border-primary/40 bg-primary/15
                px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-primary
                backdrop-blur-sm
              "
            >
              <Icon
                icon={CheckmarkCircle01Icon}
                size={10}
                strokeWidth={1.75}
                className="size-[10px]"
              />
              Concluído
            </span>
          ) : null}

          {/* Bottom-left: meta (lessons + duration) */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/90">
            <span className="flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 backdrop-blur-sm">
              <Icon
                icon={PlayCircleIcon}
                size={10}
                strokeWidth={1.75}
                className="size-[10px]"
              />
              {lessonCount} aulas
            </span>
            <span className="flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 backdrop-blur-sm">
              <Icon
                icon={Clock02Icon}
                size={10}
                strokeWidth={1.75}
                className="size-[10px]"
              />
              {formatDuration(totalDuration)}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {m.tags.map((t) => (
              <span
                key={t}
                className="rounded-md border border-edis-line-2 bg-edis-ink-2 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-edis-text-3"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <h3
              className="
                font-display text-[16px] font-medium leading-[1.2] tracking-tight text-foreground
              "
              style={{ letterSpacing: "-0.015em" }}
            >
              {m.title}
            </h3>
            <p className="line-clamp-2 text-[12.5px] leading-[1.45] text-edis-text-3">
              {m.description}
            </p>
          </div>

          {/* Progress — mint bar if started, mono caption */}
          <div className="flex flex-col gap-1.5">
            <div className="h-1 overflow-hidden rounded-full bg-edis-ink-3">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  progress.percent > 0 ? "bg-primary" : "bg-transparent"
                )}
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-edis-text-4">
              <span>
                {started
                  ? `${progress.completed}/${progress.total} concluídas`
                  : "Não iniciado"}
              </span>
              <span className="text-edis-text-3">por {m.instructor}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
