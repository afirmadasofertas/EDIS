/**
 * Mock share store. Backed by localStorage so public /s/[id] pages opened in
 * a new tab can read the same data. Will be replaced by a real backend
 * (signed tokens + server-side expiry enforcement + download telemetry).
 */

const STORAGE_KEY = "edis-drive-shares";

export type FolderShare = {
  shareId: string;
  folderId: string;
  /** Epoch ms. `null` means the share never expires. */
  expiresAt: number | null;
  createdAt: number;
  downloadCount: number;
};

export const EXPIRY_OPTIONS: ReadonlyArray<{
  value: string;
  label: string;
  ms: number | null;
}> = [
  { value: "1h",  label: "1 hora",   ms: 60 * 60 * 1000 },
  { value: "24h", label: "24 horas", ms: 24 * 60 * 60 * 1000 },
  { value: "7d",  label: "7 dias",   ms: 7 * 24 * 60 * 60 * 1000 },
  { value: "30d", label: "30 dias",  ms: 30 * 24 * 60 * 60 * 1000 },
  { value: "never", label: "Nunca",  ms: null },
];

function safeParse(raw: string | null): Record<string, FolderShare> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function loadAll(): Record<string, FolderShare> {
  if (typeof window === "undefined") return {};
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

function saveAll(shares: Record<string, FolderShare>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(shares));
}

/** 8-char alphanumeric id (collisions extremely unlikely in this demo). */
function newId(): string {
  return Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6);
}

export function getShareForFolder(folderId: string): FolderShare | null {
  const all = loadAll();
  const hit = Object.values(all).find((s) => s.folderId === folderId);
  return hit ?? null;
}

export function getShare(shareId: string): FolderShare | null {
  return loadAll()[shareId] ?? null;
}

export function createShare(
  folderId: string,
  durationMs: number | null
): FolderShare {
  const all = loadAll();
  // Revoke any existing share for the same folder so we only ever have one.
  for (const [id, s] of Object.entries(all)) {
    if (s.folderId === folderId) delete all[id];
  }
  const share: FolderShare = {
    shareId: newId(),
    folderId,
    expiresAt: durationMs === null ? null : Date.now() + durationMs,
    createdAt: Date.now(),
    downloadCount: 0,
  };
  all[share.shareId] = share;
  saveAll(all);
  return share;
}

export function revokeShare(shareId: string) {
  const all = loadAll();
  delete all[shareId];
  saveAll(all);
}

export function incrementDownload(shareId: string) {
  const all = loadAll();
  const share = all[shareId];
  if (!share) return;
  share.downloadCount += 1;
  saveAll(all);
}

/**
 * Returns true if the share is past its expiresAt. A null expiresAt means
 * "never expires".
 */
export function isExpired(share: FolderShare): boolean {
  if (share.expiresAt === null) return false;
  return Date.now() > share.expiresAt;
}

/** Format remaining time as "Xd Yh", "Xh Ym", or "Xm Ys". */
export function formatRemaining(expiresAt: number | null): string {
  if (expiresAt === null) return "Nunca expira";
  const ms = expiresAt - Date.now();
  if (ms <= 0) return "Expirado";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}
