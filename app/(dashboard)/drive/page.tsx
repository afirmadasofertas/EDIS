"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Add01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { NewFolderDialog } from "@/components/shared/new-folder-dialog";
import { NewPromptDialog } from "@/components/shared/new-prompt-dialog";
import { createClient } from "@/lib/supabase/client";
import { DriveBrowser, type LibraryMode } from "./_browser";
import { NotificationsButton } from "./_notifications-button";
import type { DriveFolder, PromptItem } from "./_data";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function DrivePage() {
  const [mode, setMode] = useState<LibraryMode>("creatives");
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [prompts, setPrompts] = useState<PromptItem[]>([]);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const [foldersRes, promptsRes] = await Promise.all([
      supabase
        .from("drive_folders")
        .select("id, name, month, year, description, created_at")
        .order("year", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("drive_prompts")
        .select("id, title, description, prompt, file_types, updated_at")
        .order("updated_at", { ascending: false }),
    ]);

    if (foldersRes.data) {
      setFolders(
        foldersRes.data.map((f) => ({
          id: f.id,
          name: f.name,
          month: f.month,
          year: f.year,
          fileCount: 0, // TODO: join with drive_files count when files ship
          description: f.description ?? undefined,
        }))
      );
    }
    if (promptsRes.data) {
      setPrompts(
        promptsRes.data.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description ?? "",
          prompt: p.prompt,
          attachmentCount: 0,
          fileTypes: p.file_types ?? [],
          updatedAt: formatUpdatedAt(p.updated_at),
        }))
      );
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleCreateFolder(folder: {
    name: string;
    month: string;
    year: number;
    description?: string;
  }) {
    const supabase = createClient();
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) throw new Error("Faça login para criar pastas.");

    const { error } = await supabase.from("drive_folders").insert({
      user_id: userRes.user.id,
      name: folder.name,
      month: folder.month,
      year: folder.year,
      description: folder.description ?? null,
    });
    if (error) throw new Error(error.message);
    await refresh();
  }

  async function handleCreatePrompt(p: {
    title: string;
    prompt: string;
    description?: string;
    files: File[];
  }) {
    const supabase = createClient();
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) throw new Error("Faça login para criar prompts.");

    const fileTypes = Array.from(
      new Set(
        p.files.map((f) =>
          f.type.startsWith("image/")
            ? "imagem"
            : f.type.startsWith("video/")
              ? "vídeo"
              : "texto"
        )
      )
    );

    const { error } = await supabase.from("drive_prompts").insert({
      user_id: userRes.user.id,
      title: p.title,
      prompt: p.prompt,
      description: p.description ?? null,
      file_types: fileTypes,
    });
    if (error) throw new Error(error.message);
    await refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="edis-tag">Drive</span>
          <h1
            className="font-display text-[30px] font-medium leading-[1.1] tracking-tight text-foreground"
            style={{ letterSpacing: "-0.025em" }}
          >
            Drive
          </h1>
          <p className="text-[14px] leading-[1.55] text-edis-text-3">
            Organize criativos e prompts em um só lugar.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <NotificationsButton />
          {mode === "prompts" ? (
            <NewPromptDialog
              onCreate={handleCreatePrompt}
              trigger={
                <PrimaryActionButton icon={Add01Icon}>
                  Novo Prompt
                </PrimaryActionButton>
              }
            />
          ) : (
            <NewFolderDialog
              onCreate={handleCreateFolder}
              trigger={
                <PrimaryActionButton icon={Add01Icon}>
                  Nova Pasta
                </PrimaryActionButton>
              }
            />
          )}
        </div>
      </header>

      <DriveBrowser
        folders={folders}
        prompts={prompts}
        mode={mode}
        onModeChange={setMode}
      />
    </div>
  );
}

function formatUpdatedAt(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function PrimaryActionButton({
  icon,
  children,
}: {
  icon: typeof Add01Icon;
  children: ReactNode;
}) {
  return (
    <Button
      size="sm"
      className="
        h-9 gap-2 rounded-md bg-primary px-3.5
        text-[13px] font-medium text-primary-foreground
        hover:bg-[#33eb8c]
      "
    >
      <Icon icon={icon} size={16} strokeWidth={2} className="size-[16px]" />
      {children}
    </Button>
  );
}
