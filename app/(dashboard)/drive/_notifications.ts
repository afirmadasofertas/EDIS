/**
 * Notifications — derived from drive_annotations on folders the current
 * user owns, with read state tracked in notification_reads.
 */

import { createClient } from "@/lib/supabase/client";

export type Notification = {
  annotationId: string;
  fileId: string;
  fileName: string;
  folderId: string;
  folderName: string;
  folderMonth: string;
  folderYear: number;
  author: string;
  note: string;
  /** Epoch ms — most recent of created/updated. */
  updatedAt: number;
  read: boolean;
};

const SELF_AUTHOR = "Você";

type AnnotationRow = {
  id: string;
  file_id: string;
  author: string;
  note: string;
  updated_at: string;
  drive_files: {
    id: string;
    name: string;
    folder_id: string;
    drive_folders: {
      id: string;
      name: string;
      month: string;
      year: number;
      user_id: string;
    } | null;
  } | null;
};

/**
 * All annotations across the current user's folders that aren't authored
 * by them, with read state from notification_reads. Sorted newest first.
 */
export async function listNotifications(): Promise<Notification[]> {
  const supabase = createClient();
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) return [];
  const userId = userRes.user.id;

  // Pull annotations + nested file + folder via embedded select. We filter
  // by the folder owner downstream because Postgres can't directly filter
  // on a deeply embedded relation.
  const { data } = await supabase
    .from("drive_annotations")
    .select(
      `
      id, file_id, author, note, updated_at,
      drive_files!inner (
        id, name, folder_id,
        drive_folders!inner (
          id, name, month, year, user_id
        )
      )
    `
    )
    .neq("author", SELF_AUTHOR)
    .order("updated_at", { ascending: false });

  const rows = (data ?? []) as unknown as AnnotationRow[];
  const owned = rows.filter(
    (r) => r.drive_files?.drive_folders?.user_id === userId
  );

  const { data: reads } = await supabase
    .from("notification_reads")
    .select("annotation_id")
    .eq("user_id", userId);
  const readSet = new Set((reads ?? []).map((r) => r.annotation_id));

  return owned.map((r) => ({
    annotationId: r.id,
    fileId: r.drive_files!.id,
    fileName: r.drive_files!.name,
    folderId: r.drive_files!.drive_folders!.id,
    folderName: r.drive_files!.drive_folders!.name,
    folderMonth: r.drive_files!.drive_folders!.month,
    folderYear: r.drive_files!.drive_folders!.year,
    author: r.author,
    note: r.note,
    updatedAt: Date.parse(r.updated_at),
    read: readSet.has(r.id),
  }));
}

export async function unreadCount(): Promise<number> {
  return (await listNotifications()).filter((n) => !n.read).length;
}

export async function markAsRead(annotationId: string): Promise<void> {
  const supabase = createClient();
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) return;
  await supabase
    .from("notification_reads")
    .upsert(
      { user_id: userRes.user.id, annotation_id: annotationId },
      { onConflict: "user_id,annotation_id" }
    );
}

export async function markAllAsRead(): Promise<void> {
  const supabase = createClient();
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) return;
  const userId = userRes.user.id;
  const ns = await listNotifications();
  const rows = ns
    .filter((n) => !n.read)
    .map((n) => ({ user_id: userId, annotation_id: n.annotationId }));
  if (rows.length === 0) return;
  await supabase
    .from("notification_reads")
    .upsert(rows, { onConflict: "user_id,annotation_id" });
}
