"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft02Icon,
  ArrowRight01Icon,
  CheckmarkCircle01Icon,
  Clock02Icon,
  PlayCircleIcon,
  SignalIcon,
  BookOpen01Icon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import {
  formatDuration,
  formatDurationShort,
  type ArticleBlock,
  type Lesson,
  type Module,
} from "../_data";
import {
  getCompletedSet,
  getLastLesson,
  markCompleted,
  rememberLastLesson,
  toggleCompleted,
} from "../_progress";

interface ModulePlayerProps {
  module: Module;
  lessons: Lesson[];
}

export function ModulePlayer({ module: m, lessons }: ModulePlayerProps) {
  const [activeId, setActiveId] = useState<string>(lessons[0]?.id ?? "");
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount — default to the last-viewed lesson
  // if one exists, otherwise the first lesson.
  useEffect(() => {
    setCompleted(getCompletedSet());
    const last = getLastLesson(m.id);
    if (last && lessons.some((l) => l.id === last)) {
      setActiveId(last);
    }
    setHydrated(true);
  }, [m.id, lessons]);

  // Persist last-viewed whenever the user switches lessons.
  useEffect(() => {
    if (hydrated && activeId) rememberLastLesson(m.id, activeId);
  }, [hydrated, m.id, activeId]);

  const activeIndex = lessons.findIndex((l) => l.id === activeId);
  const activeLesson = lessons[activeIndex] ?? lessons[0];
  const prev = activeIndex > 0 ? lessons[activeIndex - 1] : null;
  const next = activeIndex < lessons.length - 1 ? lessons[activeIndex + 1] : null;

  const totalSeconds = useMemo(
    () => lessons.reduce((sum, l) => sum + l.durationSec, 0),
    [lessons]
  );
  const percent = lessons.length
    ? Math.round(
        (lessons.filter((l) => completed.has(l.id)).length / lessons.length) *
          100
      )
    : 0;

  function handleToggleComplete(id: string) {
    toggleCompleted(id);
    setCompleted(getCompletedSet());
  }

  function handleVideoEnded() {
    if (!activeLesson) return;
    markCompleted(activeLesson.id);
    setCompleted(getCompletedSet());
  }

  function handleSelect(id: string) {
    setActiveId(id);
    // Scroll player into view on mobile where playlist is below.
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (!activeLesson) return null;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <Link
            href="/aulas"
            aria-label="Voltar para Aulas"
            className="
              mt-1 flex size-8 shrink-0 items-center justify-center rounded-md
              border border-edis-line-2 bg-edis-ink-2 text-edis-text-2
              transition-colors duration-150
              hover:border-edis-line-3 hover:bg-edis-ink-3 hover:text-foreground
            "
          >
            <Icon
              icon={ArrowLeft02Icon}
              size={16}
              strokeWidth={1.75}
              className="size-[16px]"
            />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="edis-tag">{m.tags[0] ?? "Aulas"}</span>
            <h1
              className="font-display text-[26px] font-medium leading-[1.15] tracking-tight text-foreground"
              style={{ letterSpacing: "-0.025em" }}
            >
              {m.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-edis-text-4">
              <span className="flex items-center gap-1">
                <Icon
                  icon={SignalIcon}
                  size={12}
                  strokeWidth={1.75}
                  className="size-[12px]"
                />
                {m.level}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Icon
                  icon={PlayCircleIcon}
                  size={12}
                  strokeWidth={1.75}
                  className="size-[12px]"
                />
                {lessons.length} aulas
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Icon
                  icon={Clock02Icon}
                  size={12}
                  strokeWidth={1.75}
                  className="size-[12px]"
                />
                {formatDuration(totalSeconds)}
              </span>
              <span>·</span>
              <span>por {m.instructor}</span>
            </div>
          </div>
        </div>

        {/* Module progress bar */}
        <div className="flex flex-col gap-1.5">
          <div className="h-1 overflow-hidden rounded-full bg-edis-ink-3">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-edis-text-4">
            {percent}% concluído —{" "}
            <span className="text-edis-text-2">
              {lessons.filter((l) => completed.has(l.id)).length}/{lessons.length}
            </span>{" "}
            aulas
          </span>
        </div>
      </header>

      {/* Main: player/reader + playlist sidebar (side-by-side from md up) */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {/* Player / reader */}
          <LessonSurface
            key={activeLesson.id}
            lesson={activeLesson}
            onVideoEnded={handleVideoEnded}
          />

          {/* Lesson metadata + actions */}
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-md border",
                  activeLesson.type === "video"
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-edis-line-2 bg-edis-ink-3 text-edis-text-2"
                )}
              >
                <Icon
                  icon={activeLesson.type === "video" ? PlayCircleIcon : BookOpen01Icon}
                  size={16}
                  strokeWidth={1.5}
                  className="size-[16px]"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h2
                  className="font-display text-[18px] font-medium leading-[1.25] tracking-tight text-foreground"
                  style={{ letterSpacing: "-0.015em" }}
                >
                  {activeLesson.title}
                </h2>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-edis-text-4">
                  <span className="uppercase tracking-[0.14em]">
                    Aula {activeLesson.order}
                  </span>
                  <span>·</span>
                  <span className="uppercase tracking-[0.14em]">
                    {activeLesson.type === "video" ? "Vídeo" : "Artigo"}
                  </span>
                  <span>·</span>
                  <span>
                    {activeLesson.type === "video"
                      ? formatDurationShort(activeLesson.durationSec)
                      : `${Math.ceil(activeLesson.durationSec / 60)} min de leitura`}
                  </span>
                </div>
                <p className="text-[13px] leading-[1.55] text-edis-text-2">
                  {activeLesson.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleToggleComplete(activeLesson.id)}
                className={cn(
                  "h-8 gap-1.5 border-edis-line-2 bg-edis-ink-2 text-[12px] hover:bg-edis-ink-3",
                  completed.has(activeLesson.id)
                    ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                    : "text-edis-text-2 hover:text-foreground"
                )}
              >
                <Icon
                  icon={CheckmarkCircle01Icon}
                  size={14}
                  strokeWidth={1.75}
                  className="size-[14px]"
                />
                {completed.has(activeLesson.id) ? "Concluída" : "Marcar como concluída"}
              </Button>

              <div className="ml-auto flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!prev}
                  onClick={() => prev && handleSelect(prev.id)}
                  className="h-8 gap-1.5 border-edis-line-2 bg-edis-ink-2 text-[12px] text-edis-text-2 hover:bg-edis-ink-3 hover:text-foreground disabled:opacity-40"
                >
                  <Icon
                    icon={ArrowLeft02Icon}
                    size={14}
                    strokeWidth={1.75}
                    className="size-[14px]"
                  />
                  Anterior
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!next}
                  onClick={() => {
                    if (activeLesson) markCompleted(activeLesson.id);
                    setCompleted(getCompletedSet());
                    if (next) handleSelect(next.id);
                  }}
                  className="h-8 gap-1.5 bg-primary text-[12px] font-medium text-primary-foreground hover:bg-[#33eb8c] disabled:opacity-40"
                >
                  Próxima
                  <Icon
                    icon={ArrowRight01Icon}
                    size={14}
                    strokeWidth={1.75}
                    className="size-[14px]"
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Playlist — sticky from md up so it stays in view while the main
            column scrolls. Caps its own height and scrolls internally. */}
        <aside
          aria-label="Playlist do módulo"
          className="
            flex w-full shrink-0 flex-col overflow-hidden rounded-lg
            border border-border bg-card
            md:sticky md:top-20 md:w-[340px]
            md:max-h-[calc(100vh-7rem)]
          "
        >
          <header className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
            <Icon
              icon={PlayCircleIcon}
              size={14}
              strokeWidth={1.75}
              className="size-[14px] text-edis-text-3"
            />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-edis-text-3">
              Conteúdo
            </span>
            <span className="ml-auto font-mono text-[11px] text-edis-text-4">
              {lessons.filter((l) => completed.has(l.id)).length}/{lessons.length}
            </span>
          </header>

          <ul className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            {lessons.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(l.id)}
                  className={cn(
                    "flex w-full gap-2.5 border-b border-border px-3 py-2.5 text-left transition-colors last:border-b-0",
                    l.id === activeId
                      ? "bg-primary/[0.08]"
                      : "hover:bg-edis-ink-2"
                  )}
                >
                  {/* Status icon: check if done, play if video, book if article */}
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-md border",
                      completed.has(l.id)
                        ? "border-primary/30 bg-primary/15 text-primary"
                        : l.id === activeId
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-edis-line-2 bg-edis-ink-2 text-edis-text-3"
                    )}
                  >
                    <Icon
                      icon={
                        completed.has(l.id)
                          ? CheckmarkCircle01Icon
                          : l.type === "video"
                          ? PlayCircleIcon
                          : BookOpen01Icon
                      }
                      size={14}
                      strokeWidth={1.75}
                      className="size-[14px]"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span
                      className={cn(
                        "truncate text-[12.5px] font-medium",
                        l.id === activeId ? "text-foreground" : "text-edis-text-1"
                      )}
                    >
                      {l.title}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-edis-text-4">
                      <span className="uppercase tracking-[0.1em]">
                        {l.type === "video" ? "Vídeo" : "Artigo"}
                      </span>
                      <span>·</span>
                      <span>{formatDurationShort(l.durationSec)}</span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

/* ─── Lesson surface — video player or article reader ───────────────────── */

function LessonSurface({
  lesson,
  onVideoEnded,
}: {
  lesson: Lesson;
  onVideoEnded: () => void;
}) {
  if (lesson.type === "video") {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-black">
        <video
          src={lesson.videoUrl}
          controls
          playsInline
          onEnded={onVideoEnded}
          className="aspect-video w-full"
          preload="metadata"
        />
      </div>
    );
  }

  return (
    <article
      className="
        flex flex-col gap-4 rounded-lg border border-border bg-card
        px-5 py-6 sm:px-8 sm:py-10
      "
    >
      {lesson.content?.map((b, i) => <ArticleBlockRenderer key={i} block={b} />)}
    </article>
  );
}

function ArticleBlockRenderer({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "heading":
      return block.level === 2 ? (
        <h2
          className="mt-4 font-display text-[20px] font-medium tracking-tight text-foreground first:mt-0"
          style={{ letterSpacing: "-0.015em" }}
        >
          {block.text}
        </h2>
      ) : (
        <h3
          className="mt-2 font-display text-[15.5px] font-medium tracking-tight text-foreground"
          style={{ letterSpacing: "-0.01em" }}
        >
          {block.text}
        </h3>
      );
    case "paragraph":
      return (
        <p className="text-[14px] leading-[1.7] text-edis-text-2">{block.text}</p>
      );
    case "list":
      return (
        <ul className="flex flex-col gap-1.5 pl-5">
          {block.items.map((it, i) => (
            <li
              key={i}
              className="relative text-[14px] leading-[1.7] text-edis-text-2 before:absolute before:-left-4 before:top-[0.65em] before:size-1 before:rounded-full before:bg-primary"
            >
              {it}
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote className="border-l-2 border-primary/60 pl-4 py-1">
          <p className="italic text-[14.5px] leading-[1.6] text-foreground">
            &ldquo;{block.text}&rdquo;
          </p>
          {block.attribution && (
            <cite className="mt-1 block font-mono text-[11px] not-italic text-edis-text-4">
              — {block.attribution}
            </cite>
          )}
        </blockquote>
      );
  }
}
