/**
 * Notification tracking — which annotations have been seen by the internal
 * user. Backed by localStorage so the unread badge persists across reloads.
 * Swap for real backend (user-scoped read receipts) when auth lands.
 */

import {
  getAnnotations,
  type Annotation,
} from "./_annotations";
import {
  SAMPLE_FOLDERS,
  getFolderFiles,
  type DriveFolder,
  type DriveFile,
} from "./_data";

const READ_KEY = "edis-notifications-read";

/** Author string that represents the internal user — their own comments
 *  should never show up as notifications. */
const SELF_AUTHOR = "Você";

export type Notification = {
  annotation: Annotation;
  file: DriveFile;
  folder: DriveFolder;
  read: boolean;
};

function safeLoad(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(READ_KEY) || "{}");
  } catch {
    return {};
  }
}

function save(map: Record<string, number>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(READ_KEY, JSON.stringify(map));
}

/**
 * Enumerate every annotation in the mock dataset that's NOT authored by the
 * current user, annotate each with its file + folder, and mark read/unread
 * based on the persisted map. Sorted newest first.
 */
export function listNotifications(): Notification[] {
  const read = safeLoad();
  const notifications: Notification[] = [];

  for (const folder of SAMPLE_FOLDERS) {
    for (const file of getFolderFiles(folder.id)) {
      for (const ann of getAnnotations(file.id)) {
        if (ann.author === SELF_AUTHOR) continue;
        notifications.push({
          annotation: ann,
          file,
          folder,
          read: ann.id in read,
        });
      }
    }
  }

  notifications.sort(
    (a, b) => b.annotation.updatedAt - a.annotation.updatedAt
  );
  return notifications;
}

export function unreadCount(): number {
  return listNotifications().filter((n) => !n.read).length;
}

export function markAsRead(annotationId: string) {
  const map = safeLoad();
  if (map[annotationId]) return;
  map[annotationId] = Date.now();
  save(map);
}

export function markAllAsRead() {
  const map = safeLoad();
  const ts = Date.now();
  for (const n of listNotifications()) {
    if (!map[n.annotation.id]) map[n.annotation.id] = ts;
  }
  save(map);
}
