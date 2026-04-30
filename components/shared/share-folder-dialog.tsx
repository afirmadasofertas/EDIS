"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Share08Icon,
  Copy01Icon,
  Tick02Icon,
  TimerIcon,
  Download01Icon,
  Link01Icon,
  GlobalIcon,
} from "@hugeicons/core-free-icons";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import {
  EXPIRY_OPTIONS,
  createShare,
  formatRemaining,
  getShareForFolder,
  isExpired,
  revokeShare,
  type FolderShare,
} from "@/app/(dashboard)/drive/_shares";

interface ShareFolderDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  folderId: string;
  folderName: string;
}

export function ShareFolderDialog({
  open,
  onOpenChange,
  folderId,
  folderName,
}: ShareFolderDialogProps) {
  const [share, setShare] = useState<FolderShare | null>(null);
  const [duration, setDuration] = useState<string>("7d");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setTick] = useState(0); // forces re-render for live countdown

  // Load the existing share (if any) whenever the dialog opens.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setError(null);
      const existing = await getShareForFolder(folderId);
      if (cancelled) return;
      if (existing && !isExpired(existing)) {
        setShare(existing);
      } else {
        setShare(null);
      }
      setCopied(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, folderId]);

  // Tick the countdown every second while the dialog is open and a share
  // exists with a finite expiry.
  useEffect(() => {
    if (!open || !share || share.expiresAt === null) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [open, share]);

  const shareUrl = useMemo(() => {
    if (!share) return "";
    if (typeof window === "undefined") return `/s/${share.shareId}`;
    return `${window.location.origin}/s/${share.shareId}`;
  }, [share]);

  const expired = share ? isExpired(share) : false;
  const remaining = share ? formatRemaining(share.expiresAt) : "";

  const handleGenerate = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const opt = EXPIRY_OPTIONS.find((o) => o.value === duration);
      const next = await createShare(folderId, opt?.ms ?? null);
      setShare(next);
      setCopied(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }, [duration, folderId]);

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can fail in insecure contexts — silently ignore.
    }
  }, [shareUrl]);

  const handleRevoke = useCallback(async () => {
    if (!share) return;
    setBusy(true);
    setError(null);
    try {
      await revokeShare(share.shareId);
      setShare(null);
      setCopied(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }, [share]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-lg
          flex-col gap-0 p-0
        "
      >
        <DialogHeader className="flex-row items-center gap-2 border-b border-border px-5 py-4">
          <div className="flex size-7 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
            <Icon
              icon={Share08Icon}
              size={16}
              strokeWidth={1.5}
              className="size-[16px]"
            />
          </div>
          <DialogTitle
            className="font-display text-[16px] font-medium tracking-tight text-foreground"
            style={{ letterSpacing: "-0.015em" }}
          >
            Compartilhar pasta
          </DialogTitle>
          <DialogDescription className="sr-only">
            Gere um link público com prazo de expiração para a pasta {folderName}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5">
          <div className="flex items-center gap-2">
            <Icon
              icon={GlobalIcon}
              size={14}
              strokeWidth={1.5}
              className="size-[14px] text-edis-text-4"
            />
            <p className="text-[12.5px] leading-[1.5] text-edis-text-3">
              Qualquer pessoa com o link abaixo poderá visualizar e baixar os
              arquivos desta pasta até a data de expiração. Não precisa ter conta.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-edis-line-2 bg-edis-ink-2 px-3 py-2">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-edis-text-4">
              Pasta
            </span>
            <span className="truncate text-[13px] font-medium text-foreground">
              {folderName}
            </span>
          </div>

          {!share || expired ? (
            /* ─── Not shared yet (or expired) — show generator ─── */
            <div className="flex flex-col gap-3">
              {expired && (
                <div className="rounded-md border border-[#ff5470]/30 bg-[#ff5470]/10 px-3 py-2 text-[12.5px] text-[#ff5470]">
                  Link anterior expirado. Gere um novo para continuar compartilhando.
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-edis-text-4">
                  Expira em
                </label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger
                    data-size="default"
                    className="h-9 w-full border-edis-line-2 bg-edis-ink-2 text-[13px] text-foreground focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20"
                  >
                    <Icon
                      icon={TimerIcon}
                      size={14}
                      strokeWidth={1.75}
                      className="size-[14px] text-edis-text-3"
                    />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-popover">
                    {EXPIRY_OPTIONS.map((o) => (
                      <SelectItem
                        key={o.value}
                        value={o.value}
                        className="text-[13px]"
                      >
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="font-mono text-[10.5px] text-edis-text-4">
                  Depois de expirar, o link é invalidado e os acessos registrados são apagados.
                </p>
              </div>
              {error && (
                <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-[12.5px] text-red-400">
                  {error}
                </p>
              )}
              <Button
                type="button"
                size="sm"
                disabled={busy}
                onClick={handleGenerate}
                className="h-9 gap-2 self-start bg-primary text-[13px] font-medium text-primary-foreground hover:bg-[#33eb8c] disabled:opacity-60"
              >
                <Icon
                  icon={Link01Icon}
                  size={14}
                  strokeWidth={2}
                  className="size-[14px]"
                />
                {busy ? "Gerando…" : "Gerar link"}
              </Button>
            </div>
          ) : (
            /* ─── Active share — show link + stats + copy/revoke ─── */
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="share-url"
                  className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-edis-text-4"
                >
                  Link público
                </label>
                <div className="flex items-stretch gap-2">
                  <input
                    id="share-url"
                    readOnly
                    value={shareUrl}
                    onFocus={(e) => e.currentTarget.select()}
                    className="
                      h-9 flex-1 truncate rounded-md border border-edis-line-2
                      bg-edis-ink-2 px-3 font-mono text-[12px] text-foreground
                      outline-none focus-visible:border-primary/60
                      focus-visible:ring-2 focus-visible:ring-primary/20
                    "
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCopy}
                    className={cn(
                      "h-9 gap-1.5 px-3 text-[13px] font-medium transition-colors",
                      copied
                        ? "bg-primary/15 text-primary hover:bg-primary/15"
                        : "bg-primary text-primary-foreground hover:bg-[#33eb8c]"
                    )}
                  >
                    <Icon
                      icon={copied ? Tick02Icon : Copy01Icon}
                      size={14}
                      strokeWidth={2}
                      className="size-[14px]"
                    />
                    {copied ? "Copiado" : "Copiar"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={TimerIcon}
                  label="Expira em"
                  value={remaining}
                  highlight={
                    share.expiresAt !== null &&
                    share.expiresAt - Date.now() < 60 * 60 * 1000
                  }
                />
                <StatCard
                  icon={Download01Icon}
                  label="Downloads"
                  value={share.downloadCount.toString()}
                />
              </div>

              <div className="flex items-center justify-between rounded-md border border-edis-line-2 bg-edis-ink-2 px-3 py-2.5">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[12px] font-medium text-foreground">
                    Revogar acesso
                  </span>
                  <span className="text-[11px] text-edis-text-4">
                    Invalida o link e zera o contador.
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={handleRevoke}
                  className="h-8 shrink-0 border-[#ff5470]/30 bg-[#ff5470]/10 text-[12px] text-[#ff5470] hover:border-[#ff5470]/50 hover:bg-[#ff5470]/20 disabled:opacity-60"
                >
                  {busy ? "Revogando…" : "Revogar"}
                </Button>
              </div>
              {error && (
                <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-[12.5px] text-red-400">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="m-0 flex-row justify-end gap-2 rounded-b-xl border-t border-border bg-card px-5 py-3 sm:justify-end">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 border-edis-line-2 bg-transparent text-[13px] text-edis-text-2 hover:bg-edis-ink-3 hover:text-foreground"
            >
              Fechar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: typeof TimerIcon;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-edis-line-2 bg-edis-ink-2 px-3 py-2.5">
      <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-edis-text-4">
        <Icon
          icon={icon}
          size={11}
          strokeWidth={1.75}
          className="size-[11px]"
        />
        {label}
      </span>
      <span
        className={cn(
          "font-mono text-[14px] font-medium",
          highlight ? "text-[#ff5470]" : "text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  );
}
