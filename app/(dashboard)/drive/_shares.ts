/**
 * Folder share management — backed by the public.drive_shares table in
 * Supabase. Owner-RLS + a public read policy for non-expired shares means:
 *   - the dialog (authed) can create / read / revoke their own shares
 *   - the /s/<id> page (anon) can resolve the share, folder, and files
 */

import { createClient } from "@/lib/supabase/client";

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
  { value: "1h", label: "1 hora", ms: 60 * 60 * 1000 },
  { value: "24h", label: "24 horas", ms: 24 * 60 * 60 * 1000 },
  { value: "7d", label: "7 dias", ms: 7 * 24 * 60 * 60 * 1000 },
  { value: "30d", label: "30 dias", ms: 30 * 24 * 60 * 60 * 1000 },
  { value: "never", label: "Nunca", ms: null },
];

type Row = {
  id: string;
  folder_id: string;
  expires_at: string | null;
  created_at: string;
  download_count: number;
};

function rowToShare(r: Row): FolderShare {
  return {
    shareId: r.id,
    folderId: r.folder_id,
    expiresAt: r.expires_at ? Date.parse(r.expires_at) : null,
    createdAt: Date.parse(r.created_at),
    downloadCount: r.download_count,
  };
}

/** Short URL-safe id, similar to the legacy localStorage version. */
function newId(): string {
  return (
    Math.random().toString(36).slice(2, 6) +
    Math.random().toString(36).slice(2, 6)
  );
}

export async function getShareForFolder(
  folderId: string
): Promise<FolderShare | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("drive_shares")
    .select("id, folder_id, expires_at, created_at, download_count")
    .eq("folder_id", folderId)
    .maybeSingle();
  return data ? rowToShare(data as Row) : null;
}

export async function getShare(shareId: string): Promise<FolderShare | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("drive_shares")
    .select("id, folder_id, expires_at, created_at, download_count")
    .eq("id", shareId)
    .maybeSingle();
  return data ? rowToShare(data as Row) : null;
}

export async function createShare(
  folderId: string,
  durationMs: number | null
): Promise<FolderShare> {
  const supabase = createClient();
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) throw new Error("Faça login para gerar links.");

  // Drop the existing share for this folder, if any (unique constraint).
  await supabase.from("drive_shares").delete().eq("folder_id", folderId);

  const id = newId();
  const expiresAt =
    durationMs === null ? null : new Date(Date.now() + durationMs).toISOString();

  const { data, error } = await supabase
    .from("drive_shares")
    .insert({
      id,
      user_id: userRes.user.id,
      folder_id: folderId,
      expires_at: expiresAt,
    })
    .select("id, folder_id, expires_at, created_at, download_count")
    .single();
  if (error) throw new Error(error.message);
  return rowToShare(data as Row);
}

export async function revokeShare(shareId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("drive_shares")
    .delete()
    .eq("id", shareId);
  if (error) throw new Error(error.message);
}

export async function incrementDownload(shareId: string): Promise<void> {
  const supabase = createClient();
  await supabase.rpc("increment_share_downloads", { p_share_id: shareId });
}

export function isExpired(share: FolderShare): boolean {
  if (share.expiresAt === null) return false;
  return Date.now() > share.expiresAt;
}

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
