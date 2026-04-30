"use client";

import Link from "next/link";
import {
  Folder01Icon,
  ArrowRight01Icon,
  PencilEdit01Icon,
  Delete02Icon,
  Share08Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

interface FolderListItemProps {
  href: string;
  name: string;
  month: string;
  year: number;
  fileCount: number;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
}

export function FolderListItem({
  href,
  name,
  month,
  year,
  fileCount,
  className,
  onEdit,
  onDelete,
  onShare,
}: FolderListItemProps) {
  const hasActions = Boolean(onEdit || onDelete || onShare);

  return (
    <div className={cn("group relative", className)}>
      <Link
        href={href}
        className="
          block rounded-lg outline-none
          focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background
        "
      >
        <div
          className="
            flex items-center gap-3 rounded-lg border border-border bg-card
            px-3 py-2.5
            transition-colors duration-150
            group-hover:border-edis-line-3 group-hover:bg-edis-ink-2
          "
        >
          {/* Mint halo + deep-mint chip + white icon. Same treatment as FolderCard. */}
          <div
            className="
              flex size-9 shrink-0 items-center justify-center rounded-md
              border border-primary/15 bg-primary/10 p-[2.5px]
              transition-all duration-150
              group-hover:border-primary/30 group-hover:bg-primary/15
            "
          >
            <div
              className="
                flex h-full w-full items-center justify-center rounded-[5px]
                bg-gradient-to-br from-[#007F3E] to-[#00572B] text-white
              "
            >
              <Icon
                icon={Folder01Icon}
                size={16}
                strokeWidth={2.25}
                className="size-[16px]"
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[13.5px] font-medium text-foreground">
              {name}
            </span>
            <span className="font-mono text-[10.5px] text-edis-text-4">
              {month} {year}
            </span>
          </div>

          <span
            className="
              hidden shrink-0 rounded-md border border-edis-line-2 bg-edis-ink-2
              px-2 py-0.5 font-mono text-[10.5px] font-medium text-edis-text-3
              sm:inline-flex
            "
          >
            {fileCount} arquivos
          </span>

          {/* Spacer so the hover toolbar doesn't overlap the file count badge. */}
          {hasActions ? (
            <span className="w-[72px] shrink-0" aria-hidden />
          ) : (
            <Icon
              icon={ArrowRight01Icon}
              size={14}
              strokeWidth={1.75}
              className="size-[14px] shrink-0 text-edis-text-4 transition-colors group-hover:text-edis-text-2"
            />
          )}
        </div>
      </Link>

      {/* Hover actions layered on top of the row */}
      {hasActions && (
        <div
          className="
            pointer-events-none absolute right-3 top-1/2 -translate-y-1/2
            flex items-center gap-1
            opacity-0 transition-opacity duration-150
            group-hover:pointer-events-auto group-hover:opacity-100
            focus-within:pointer-events-auto focus-within:opacity-100
          "
        >
          {onShare && (
            <RowAction
              label="Compartilhar"
              icon={Share08Icon}
              onClick={onShare}
            />
          )}
          {onEdit && (
            <RowAction
              label="Editar"
              icon={PencilEdit01Icon}
              onClick={onEdit}
            />
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
      )}
    </div>
  );
}

function RowAction({
  label,
  icon,
  onClick,
  destructive = false,
}: {
  label: string;
  icon: typeof PencilEdit01Icon;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
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
