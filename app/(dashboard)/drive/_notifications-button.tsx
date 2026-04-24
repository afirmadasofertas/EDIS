"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Notification01Icon,
  Cancel01Icon,
  Comment01Icon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import {
  listNotifications,
  markAllAsRead,
  markAsRead,
  unreadCount,
  type Notification,
} from "./_notifications";
import { formatRelative } from "./_annotations";

/**
 * Bell button for the Drive page header. Shows an unread badge and opens a
 * popover listing recent comments from external users. Clicking an item
 * marks it as read and navigates to the corresponding folder.
 */
export function NotificationsButton() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => {
    const next = listNotifications();
    setItems(next);
    setUnread(next.filter((n) => !n.read).length);
  }, []);

  // Refresh on mount, whenever the popover opens, and when storage changes
  // from another tab (e.g. public share page commits a comment).
  useEffect(() => {
    refresh();
    function onStorage(e: StorageEvent) {
      if (
        e.key === "edis-file-annotations" ||
        e.key === "edis-notifications-read"
      ) {
        refresh();
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  // Dismiss popover on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Re-tick timestamps every minute so "2m atrás" stays fresh.
  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => setItems((prev) => [...prev]), 60_000);
    return () => window.clearInterval(id);
  }, [open]);

  function handleItemClick(n: Notification) {
    markAsRead(n.annotation.id);
    setOpen(false);
    refresh();
  }

  function handleMarkAllRead() {
    markAllAsRead();
    refresh();
  }

  return (
    <div ref={wrapperRef} className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label="Caixa de mensagens"
        onClick={() => setOpen((o) => !o)}
        className="
          relative h-9 w-9 shrink-0 justify-center rounded-md border-edis-line-2
          bg-edis-ink-2 px-0
          text-edis-text-2 hover:bg-edis-ink-3 hover:text-foreground
        "
      >
        <Icon
          icon={Notification01Icon}
          size={16}
          strokeWidth={1.75}
          className="size-[16px]"
        />
        {unread > 0 && (
          <span
            className="
              absolute -right-1 -top-1 flex size-4 items-center justify-center
              rounded-full bg-primary text-primary-foreground
              font-mono text-[9px] font-semibold leading-none
              ring-2 ring-background
            "
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label="Caixa de mensagens"
          className="
            absolute right-0 top-full z-30 mt-2 w-[340px] overflow-hidden
            rounded-lg border border-border bg-popover
            shadow-[0_12px_36px_rgba(0,0,0,0.55)]
          "
        >
          <header className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Icon
              icon={Notification01Icon}
              size={14}
              strokeWidth={1.75}
              className="size-[14px] text-edis-text-3"
            />
            <span className="font-display text-[13px] font-medium tracking-tight text-foreground">
              Caixa de mensagens
            </span>
            <span className="font-mono text-[10.5px] text-edis-text-4">
              · {items.length}
            </span>
            {unread > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-edis-text-3 transition-colors hover:text-foreground"
              >
                Marcar todas como lidas
              </button>
            )}
            <button
              type="button"
              aria-label="Fechar"
              onClick={() => setOpen(false)}
              className={cn(
                unread === 0 && "ml-auto",
                "flex size-6 items-center justify-center rounded-md text-edis-text-4 hover:bg-edis-ink-3 hover:text-foreground"
              )}
            >
              <Icon
                icon={Cancel01Icon}
                size={12}
                strokeWidth={2}
                className="size-[12px]"
              />
            </button>
          </header>

          <div className="max-h-[420px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <div className="flex size-9 items-center justify-center rounded-md border border-edis-line-2 bg-edis-ink-2 text-edis-text-3">
                  <Icon
                    icon={Comment01Icon}
                    size={16}
                    strokeWidth={1.5}
                    className="size-[16px]"
                  />
                </div>
                <span className="edis-tag">Sem mensagens</span>
                <p className="max-w-[220px] text-[11.5px] leading-[1.5] text-edis-text-3">
                  Comentários deixados por clientes em pastas compartilhadas aparecem aqui.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col">
                {items.map((n) => (
                  <li key={n.annotation.id}>
                    <Link
                      href={`/drive/${n.folder.id}`}
                      onClick={() => handleItemClick(n)}
                      className={cn(
                        "flex gap-2.5 border-b border-border px-4 py-3 transition-colors last:border-b-0",
                        n.read
                          ? "hover:bg-edis-ink-2"
                          : "bg-primary/[0.04] hover:bg-primary/[0.08]"
                      )}
                    >
                      {/* Unread indicator */}
                      <span
                        className={cn(
                          "mt-1.5 size-1.5 shrink-0 rounded-full",
                          n.read ? "bg-transparent" : "bg-primary"
                        )}
                        aria-hidden
                      />
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12.5px] font-medium text-foreground">
                            {n.annotation.author}
                          </span>
                          <span className="font-mono text-[10px] text-edis-text-4">
                            · {formatRelative(n.annotation.updatedAt)}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-[12px] leading-[1.4] text-edis-text-2">
                          {n.annotation.note || (
                            <span className="italic text-edis-text-4">
                              (sem texto)
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-1 font-mono text-[10px] text-edis-text-4">
                          <span className="truncate">{n.file.name}</span>
                          <span>·</span>
                          <span className="truncate">{n.folder.name}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
