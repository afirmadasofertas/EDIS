/**
 * Mock annotation store. One entry per file-pin. Backed by localStorage so
 * annotations persist across reloads within the same browser. Swap for real
 * backend (WebSocket channel per file + auth-aware authorship) when it ships.
 */

const STORAGE_KEY = "edis-file-annotations";

export type Annotation = {
  id: string;
  fileId: string;
  /** Relative coordinates 0..1 (so pins stay anchored when image resizes). */
  x: number;
  y: number;
  note: string;
  author: string;
  createdAt: number;
  updatedAt: number;
};

function safeParse(raw: string | null): Record<string, Annotation> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function loadAll(): Record<string, Annotation> {
  if (typeof window === "undefined") return {};
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

function saveAll(all: Record<string, Annotation>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function newId(): string {
  return Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6);
}

/**
 * Returns the annotations for a file, sorted by creation time. The numeric
 * label shown on each pin is just its index in this sorted array + 1.
 */
export function getAnnotations(fileId: string): Annotation[] {
  const all = loadAll();
  return Object.values(all)
    .filter((a) => a.fileId === fileId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function addAnnotation(
  fileId: string,
  x: number,
  y: number,
  author = "Você"
): Annotation {
  const now = Date.now();
  const ann: Annotation = {
    id: newId(),
    fileId,
    x,
    y,
    note: "",
    author,
    createdAt: now,
    updatedAt: now,
  };
  const all = loadAll();
  all[ann.id] = ann;
  saveAll(all);
  return ann;
}

export function updateAnnotation(id: string, note: string) {
  const all = loadAll();
  const ann = all[id];
  if (!ann) return;
  ann.note = note;
  ann.updatedAt = Date.now();
  saveAll(all);
}

/** Reposition an existing pin. Coordinates are relative (0..1). */
export function moveAnnotation(id: string, x: number, y: number) {
  const all = loadAll();
  const ann = all[id];
  if (!ann) return;
  ann.x = Math.max(0, Math.min(1, x));
  ann.y = Math.max(0, Math.min(1, y));
  ann.updatedAt = Date.now();
  saveAll(all);
}

export function deleteAnnotation(id: string) {
  const all = loadAll();
  delete all[id];
  saveAll(all);
}

/** Format "agora" / "2m atrás" / "1h atrás" / "3d atrás" / date string. */
export function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 10) return "agora";
  if (s < 60) return `${s}s atrás`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d atrás`;
  return new Date(ts).toLocaleDateString("pt-BR");
}
