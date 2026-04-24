/**
 * Lesson completion tracking. localStorage-backed so it survives reloads.
 * Swap for user-scoped backend (course enrollments + completion events)
 * when auth ships.
 */

import { LESSONS, getLessonsForModule } from "./_data";

const STORAGE_KEY = "edis-aulas-completed";
const LAST_LESSON_KEY = "edis-aulas-last-lesson";

function safeLoad(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function save(map: Record<string, number>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function isCompleted(lessonId: string): boolean {
  return Boolean(safeLoad()[lessonId]);
}

export function markCompleted(lessonId: string) {
  const map = safeLoad();
  if (map[lessonId]) return;
  map[lessonId] = Date.now();
  save(map);
}

export function toggleCompleted(lessonId: string) {
  const map = safeLoad();
  if (map[lessonId]) delete map[lessonId];
  else map[lessonId] = Date.now();
  save(map);
}

export function getCompletedSet(): Set<string> {
  return new Set(Object.keys(safeLoad()));
}

/** Count completed lessons for a given module. */
export function getModuleProgress(moduleId: string): {
  completed: number;
  total: number;
  percent: number;
} {
  const lessons = getLessonsForModule(moduleId);
  const total = lessons.length;
  if (total === 0) return { completed: 0, total: 0, percent: 0 };
  const map = safeLoad();
  const completed = lessons.filter((l) => map[l.id]).length;
  return { completed, total, percent: Math.round((completed / total) * 100) };
}

/** Total duration across all lessons in a module (seconds). */
export function getModuleTotalDuration(moduleId: string): number {
  return getLessonsForModule(moduleId).reduce(
    (sum, l) => sum + l.durationSec,
    0
  );
}

/** Count of lessons in a module. */
export function getModuleLessonCount(moduleId: string): number {
  return LESSONS.filter((l) => l.moduleId === moduleId).length;
}

/** Track the last lesson the user opened in each module (for resume). */
export function rememberLastLesson(moduleId: string, lessonId: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(LAST_LESSON_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    map[moduleId] = lessonId;
    window.localStorage.setItem(LAST_LESSON_KEY, JSON.stringify(map));
  } catch {
    // ignore quota / parse errors
  }
}

export function getLastLesson(moduleId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LAST_LESSON_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    return map[moduleId] ?? null;
  } catch {
    return null;
  }
}
