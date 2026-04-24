"use client";

import Link from "next/link";
import {
  Folder01Icon,
  PencilEdit01Icon,
  Delete02Icon,
  Share08Icon,
} from "@hugeicons/core-free-icons";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

interface FolderCardProps {
  href: string;
  name: string;
  month: string;
  year: number;
  fileCount: number;
  className?: string;
  /** Optional hover-action callbacks. Parent owns the dialogs. */
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
}

export function FolderCard({
  href,
  name,
  month,
  year,
  fileCount,
  className,
  onEdit,
  onDelete,
  onShare,
}: FolderCardProps) {
  const hasActions = Boolean(onEdit || onDelete || onShare);

  return (
    <div className={cn("group relative", className)}>
      {/* Clickable card body */}
      <Link
        href={href}
        className="
          block rounded-xl outline-none
          focus-visible:ring-2 focus-visible:ring-primary/60
          focus-visible:ring-offset-2 focus-visible:ring-offset-background
        "
      >
        <Card
          className="
            flex flex-col gap-3 border-border bg-card p-4 shadow-none
            transition-colors duration-150
            group-hover:border-edis-line-3
            group-hover:bg-edis-ink-2
          "
        >
          <div
            className="
              flex size-10 items-center justify-center rounded-lg
              border border-primary/20 bg-primary/10 text-primary
              transition-colors duration-150
              group-hover:border-primary/30 group-hover:bg-primary/15
            "
          >
            <Icon
              icon={Folder01Icon}
              size={20}
              strokeWidth={1.5}
              className="size-[20px]"
            />
          </div>

          <div className="flex flex-col gap-0.5 pt-1">
            <h3 className="truncate text-[13.5px] font-medium leading-tight text-foreground">
              {name}
            </h3>
            <p className="text-[12px] text-edis-text-4">
              {month} {year}
            </p>
          </div>

          <div>
            <span
              className="
                inline-flex items-center rounded-md border border-edis-line-2
                bg-edis-ink-2 px-2 py-0.5
                font-mono text-[10.5px] font-medium text-edis-text-3
              "
            >
              {fileCount} arquivos
            </span>
          </div>
        </Card>
      </Link>

      {/* Hover action toolbar — sits above the Link so clicks don't navigate. */}
      {hasActions && (
        <div
          className="
            pointer-events-none absolute right-3 top-3 flex items-center gap-1
            opacity-0 transition-opacity duration-150
            group-hover:pointer-events-auto group-hover:opacity-100
            focus-within:pointer-events-auto focus-within:opacity-100
          "
        >
          {onShare && (
            <ActionButton
              label="Compartilhar"
              icon={Share08Icon}
              onClick={onShare}
            />
          )}
          {onEdit && (
            <ActionButton
              label="Editar"
              icon={PencilEdit01Icon}
              onClick={onEdit}
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
  );
}

function ActionButton({
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
        "flex size-7 items-center justify-center rounded-md border transition-colors duration-150",
        destructive
          ? "border-[#ff5470]/30 bg-[#ff5470]/10 text-[#ff5470] hover:border-[#ff5470]/50 hover:bg-[#ff5470]/20"
          : "border-edis-line-2 bg-edis-ink-3 text-edis-text-2 hover:border-edis-line-3 hover:bg-edis-ink-4 hover:text-foreground"
      )}
    >
      <Icon icon={icon} size={14} strokeWidth={1.75} className="size-[14px]" />
    </button>
  );
}
