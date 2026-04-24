"use client";

import Image from "next/image";
import {
  File01Icon,
  VideoReplayIcon,
  ViewIcon,
  PencilEdit01Icon,
  Download01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

interface FileCardProps {
  name: string;
  size: number;
  kind: "image" | "video" | "other";
  thumbnailUrl?: string;
  className?: string;
  /** Hover-action callbacks. Dialogs/navigation are handled by the parent. */
  onPreview?: () => void;
  onRename?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
}

export function FileCard({
  name,
  size,
  kind,
  thumbnailUrl,
  className,
  onPreview,
  onRename,
  onDownload,
  onDelete,
}: FileCardProps) {
  const hasActions = Boolean(
    onPreview || onRename || onDownload || onDelete
  );

  return (
    <div className={cn("group flex flex-col gap-2", className)}>
      <div
        className="
          relative overflow-hidden rounded-lg border border-edis-line-2
          bg-edis-ink-3 transition-colors duration-150
          group-hover:border-edis-line-3
        "
      >
        {kind === "image" && thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={name}
            width={480}
            height={600}
            sizes="(min-width: 1536px) 16vw, (min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw"
            className="aspect-[4/5] h-auto w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[4/5] w-full items-center justify-center text-edis-text-3">
            <Icon
              icon={kind === "video" ? VideoReplayIcon : File01Icon}
              size={28}
              strokeWidth={1.5}
              className="size-[28px]"
            />
          </div>
        )}

        {hasActions && (
          <div
            className="
              pointer-events-none absolute right-2 top-2 flex items-center gap-1
              opacity-0 transition-opacity duration-150
              group-hover:pointer-events-auto group-hover:opacity-100
              focus-within:pointer-events-auto focus-within:opacity-100
            "
          >
            {onPreview && (
              <ActionButton
                label="Visualizar"
                icon={ViewIcon}
                onClick={onPreview}
              />
            )}
            {onRename && (
              <ActionButton
                label="Renomear"
                icon={PencilEdit01Icon}
                onClick={onRename}
              />
            )}
            {onDownload && (
              <ActionButton
                label="Baixar"
                icon={Download01Icon}
                onClick={onDownload}
              />
            )}
            {onDelete && (
              <ActionButton
                label="Excluir"
                icon={Delete02Icon}
                onClick={onDelete}
                destructive
              />
            )}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col">
        <span
          className="truncate text-[13px] font-medium text-foreground"
          title={name}
        >
          {name}
        </span>
        <span className="font-mono text-[11px] text-edis-text-4">
          {formatBytes(size)}
        </span>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
  destructive = false,
}: {
  label: string;
  icon: typeof ViewIcon;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "flex size-7 items-center justify-center rounded-md backdrop-blur-sm transition-colors duration-150",
        destructive
          ? "bg-[#ff5470] text-white hover:bg-[#ff3a5a]"
          : "bg-black/60 text-white hover:bg-black/80"
      )}
    >
      <Icon icon={icon} size={14} strokeWidth={1.75} className="size-[14px]" />
    </button>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
