/**
 * Annotation store — backed by public.drive_annotations in Supabase.
 * Owner-RLS handles authoring on their own folders; the public share
 * page authors as 'Cliente' via the public INSERT policy.
 */

import { createClient } from "@/lib/supabase/client";

export type Annotation = {
  id: string;
  fileId: string;
  /** Relative coordinates 0..1 (so pins stay anchored when the image scales). */
  x: number;
  y: number;
  note: string;
  author: string;
  createdAt: number;
  updatedAt: number;
};

type Row = {
  id: string;
  file_id: string;
  x: number;
  y: number;
  note: string;
  author: string;
  created_at: string;
  updated_at: string;
};

function rowToAnnotation(r: Row): Annotation {
  return {
    id: r.id,
    fileId: r.file_id,
    x: r.x,
    y: r.y,
    note: r.note,
    author: r.author,
    createdAt: Date.parse(r.created_at),
    updatedAt: Date.parse(r.updated_at),
  };
}

function newId(): string {
  return (
    Math.random().toString(36).slice(2, 6) +
    Math.random().toString(36).slice(2, 6)
  );
}

/** Returns the annotations for a file, sorted by creation time. */
export async function getAnnotations(fileId: string): Promise<Annotation[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("drive_annotations")
    .select("id, file_id, x, y, note, author, created_at, updated_at")
    .eq("file_id", fileId)
    .order("created_at", { ascending: true });
  return (data ?? []).map((r) => rowToAnnotation(r as Row));
}

export async function addAnnotation(
  fileId: string,
  x: number,
  y: number,
  author = "Você"
): Promise<Annotation> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("drive_annotations")
    .insert({
      id: newId(),
      file_id: fileId,
      x,
      y,
      author,
      note: "",
    })
    .select("id, file_id, x, y, note, author, created_at, updated_at")
    .single();
  if (error) throw new Error(error.message);
  return rowToAnnotation(data as Row);
}

export async function updateAnnotation(id: string, note: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("drive_annotations")
    .update({ note, updated_at: new Date().toISOString() })
    .eq("id", id);
}

/** Reposition an existing pin. Coordinates are relative (0..1). */
export async function moveAnnotation(
  id: string,
  x: number,
  y: number
): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("drive_annotations")
    .update({
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
}

export async function deleteAnnotation(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("drive_annotations").delete().eq("id", id);
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
