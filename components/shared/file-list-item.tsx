"use client";

import { useState } from "react";
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

interface FileListItemProps {
  id: string;
  name: string;
  size: number;
  kind: "image" | "video" | "other";
  thumbnailUrl?: string;
  onPreview?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  className?: string;
}

export function FileListItem({
  name,
  size,
  kind,
  thumbnailUrl,
  onPreview,
  onRename,
  onDelete,
  onDownload,
  className,
}: FileListItemProps) {
  const [errored, setErrored] = useState(false);
  const showImage = kind === "image" && thumbnailUrl && !errored;

  return (
    <li
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 transition-colors duration-150 hover:border-edis-line-3 hover:bg-edis-ink-2",
        className
      )}
    >
      {/* Thumbnail (40×40 square) */}
      <div
        className="
          flex size-10 shrink-0 items-center justify-center overflow-hidden
          rounded-md border border-edis-line-2 bg-edis-ink-3 text-edis-text-3
        "
      >
        {showImage ? (
          <Image
            src={thumbnailUrl!}
            alt={name}
            width={80}
            height={80}
            className="h-full w-full object-cover"
            onError={() => setErrored(true)}
          />
        ) : (
          <Icon
            icon={kind === "video" ? VideoReplayIcon : File01Icon}
            size={18}
            strokeWidth={1.5}
            className="size-[18px]"
          />
        )}
      </div>

      {/* Name + size */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[13.5px] font-medium text-foreground">
          {name}
        </span>
        <span className="font-mono text-[10.5px] text-edis-text-4">
          {formatBytes(size)}
        </span>
      </div>

      {/* Actions — always visible on hover, never on resting state */}
      <div className="flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
        {onPreview && (
          <RowAction label="Visualizar" icon={ViewIcon} onClick={onPreview} />
        )}
        {onRename && (
          <RowAction label="Renomear" icon={PencilEdit01Icon} onClick={onRename} />
        )}
        {onDownload && (
          <RowAction label="Baixar" icon={Download01Icon} onClick={onDownload} />
        )}
        {onDelete && (
          <RowAction
            label="Excluir"
            icon={Delete02Icon}
            onClick={onDelete}
            destructive
          />
        )}
      </div>
    </li>
  );
}

function RowAction({
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
        "flex size-7 items-center justify-center rounded-md transition-colors duration-150",
        destructive
          ? "text-edis-text-3 hover:bg-[#ff5470]/15 hover:text-[#ff5470]"
          : "text-edis-text-3 hover:bg-edis-ink-3 hover:text-foreground"
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
