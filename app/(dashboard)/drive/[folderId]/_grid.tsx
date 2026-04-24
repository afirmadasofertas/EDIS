"use client";

import { useState } from "react";
import {
  DashboardSquare02Icon,
  ParagraphBulletsPoint01Icon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/icon";
import { FileCard } from "@/components/shared/file-card";
import { FileListItem } from "@/components/shared/file-list-item";
import {
  FilePreviewDialog,
  RenameFileDialog,
  DeleteFileDialog,
} from "@/components/shared/file-dialogs";
import { cn } from "@/lib/utils";
import type { DriveFile } from "../_data";

interface FilesGridProps {
  initialFiles: DriveFile[];
}

type DialogKind = "preview" | "rename" | "delete";

export function FilesGrid({ initialFiles }: FilesGridProps) {
  const [files, setFiles] = useState<DriveFile[]>(initialFiles);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [activeFile, setActiveFile] = useState<DriveFile | null>(null);
  const [activeDialog, setActiveDialog] = useState<DialogKind | null>(null);

  function openDialog(file: DriveFile, kind: DialogKind) {
    setActiveFile(file);
    setActiveDialog(kind);
  }
  function closeDialog() {
    setActiveDialog(null);
    // Keep activeFile briefly so the dialog's closing animation still has content.
  }

  function handleDownload(file: DriveFile) {
    if (!file.thumbnailUrl) return;
    window.open(file.thumbnailUrl, "_blank", "noopener,noreferrer");
  }

  function handleRename(id: string, newName: string) {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: newName } : f))
    );
  }

  function handleDelete(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  const empty = files.length === 0;

  return (
    <div className="flex flex-col gap-6">
      {/* View toggle */}
      <div className="flex items-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-edis-text-4">
          <span className="text-edis-text-2">{files.length}</span>{" "}
          {files.length === 1 ? "arquivo" : "arquivos"}
        </span>
        <div className="ml-auto flex items-center gap-0.5 rounded-md border border-edis-line-2 bg-edis-ink-2 p-0.5">
          <ViewToggle
            icon={DashboardSquare02Icon}
            label="Grade"
            active={view === "grid"}
            onClick={() => setView("grid")}
          />
          <ViewToggle
            icon={ParagraphBulletsPoint01Icon}
            label="Lista"
            active={view === "list"}
            onClick={() => setView("list")}
          />
        </div>
      </div>

      {/* Results */}
      {empty ? (
        <EmptyState />
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {files.map((f) => (
            <FileCard
              key={f.id}
              name={f.name}
              size={f.size}
              kind={f.kind}
              thumbnailUrl={f.thumbnailUrl}
              onPreview={() => openDialog(f, "preview")}
              onRename={() => openDialog(f, "rename")}
              onDownload={() => handleDownload(f)}
              onDelete={() => openDialog(f, "delete")}
            />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {files.map((f) => (
            <FileListItem
              key={f.id}
              id={f.id}
              name={f.name}
              size={f.size}
              kind={f.kind}
              thumbnailUrl={f.thumbnailUrl}
              onPreview={() => openDialog(f, "preview")}
              onRename={() => openDialog(f, "rename")}
              onDownload={() => handleDownload(f)}
              onDelete={() => openDialog(f, "delete")}
            />
          ))}
        </ul>
      )}

      {/* Centralized dialogs (used by both grid and list) */}
      {activeFile && (
        <>
          <FilePreviewDialog
            open={activeDialog === "preview"}
            onOpenChange={(o) => (o ? null : closeDialog())}
            fileId={activeFile.id}
            name={activeFile.name}
            thumbnailUrl={activeFile.thumbnailUrl}
            kind={activeFile.kind}
            onDownload={() => handleDownload(activeFile)}
          />
          <RenameFileDialog
            open={activeDialog === "rename"}
            onOpenChange={(o) => (o ? null : closeDialog())}
            currentName={activeFile.name}
            onSave={(newName) => handleRename(activeFile.id, newName)}
          />
          <DeleteFileDialog
            open={activeDialog === "delete"}
            onOpenChange={(o) => (o ? null : closeDialog())}
            name={activeFile.name}
            onConfirm={() => handleDelete(activeFile.id)}
          />
        </>
      )}
    </div>
  );
}

function ViewToggle({
  icon,
  label,
  active,
  onClick,
}: {
  icon: typeof DashboardSquare02Icon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded transition-colors",
        active
          ? "bg-primary/15 text-primary"
          : "text-edis-text-3 hover:bg-edis-ink-3 hover:text-foreground"
      )}
    >
      <Icon icon={icon} size={18} strokeWidth={1.75} className="size-[18px]" />
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-10 text-center">
      <span className="edis-tag">Sem arquivos</span>
      <p className="max-w-sm text-[13.5px] text-edis-text-3">
        Esta pasta está vazia. Use o botão{" "}
        <strong>Upload de Arquivos</strong> acima pra subir seus primeiros
        criativos.
      </p>
    </div>
  );
}
