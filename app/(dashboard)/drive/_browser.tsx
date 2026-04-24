"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlarmClockIcon,
  Calendar01Icon,
  Cancel01Icon,
  Copy01Icon,
  Delete02Icon,
  File02Icon,
  Folder01Icon,
  FolderLibraryIcon,
  PencilEdit01Icon,
  Search01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/icon";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteFolderDialog, EditFolderDialog } from "@/components/shared/folder-dialogs";
import { FolderCard } from "@/components/shared/folder-card";
import { ShareFolderDialog } from "@/components/shared/share-folder-dialog";
import { cn } from "@/lib/utils";
import type { DriveFolder, DriveFolderUpdate, PromptItem } from "./_data";

const ALL = "__all__";

type FolderDialogKind = "edit" | "delete" | "share";
export type LibraryMode = "creatives" | "prompts";

interface DriveBrowserProps {
  folders: DriveFolder[];
  prompts: PromptItem[];
  mode: LibraryMode;
  onModeChange: (mode: LibraryMode) => void;
}

export function DriveBrowser({
  folders: initialFolders,
  prompts,
  mode,
  onModeChange,
}: DriveBrowserProps) {
  const router = useRouter();
  const [folders, setFolders] = useState<DriveFolder[]>(initialFolders);
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState<string>(ALL);
  const [year, setYear] = useState<string>(ALL);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFolder, setActiveFolder] = useState<DriveFolder | null>(null);
  const [activeDialog, setActiveDialog] = useState<FolderDialogKind | null>(null);

  function openDialog(f: DriveFolder, kind: FolderDialogKind) {
    setActiveFolder(f);
    setActiveDialog(kind);
  }

  function closeDialog() {
    setActiveDialog(null);
  }

  function handleEditFolder(id: string, updates: DriveFolderUpdate) {
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  }

  function handleDeleteFolder(id: string) {
    setFolders((prev) => prev.filter((f) => f.id !== id));
  }

  const monthOptions = useMemo(
    () => [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ],
    []
  );

  const yearOptions = useMemo(
    () => ["2028", "2027", "2026", "2025", "2024"],
    []
  );

  const filteredFolders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return folders.filter((f) => {
      if (q && !f.name.toLowerCase().includes(q)) return false;
      if (month !== ALL && f.month !== month) return false;
      if (year !== ALL && f.year.toString() !== year) return false;
      return true;
    });
  }, [folders, month, query, year]);

  const filteredPrompts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return prompts.filter((p) => {
      if (
        q &&
        !`${p.title} ${p.description} ${p.prompt}`.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (month !== ALL && !p.updatedAt.includes(month)) return false;
      if (year !== ALL && !p.updatedAt.includes(year)) return false;
      return true;
    });
  }, [month, prompts, query, year]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || mode !== "creatives") return [];
    return folders
      .filter((f) => f.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [folders, mode, query]);

  const searchRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const hasAnyFilter = Boolean(query) || month !== ALL || year !== ALL;
  const resultCount =
    mode === "creatives" ? filteredFolders.length : filteredPrompts.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div ref={searchRef} className="relative flex-1 sm:max-w-sm">
          <Icon
            icon={Search01Icon}
            size={14}
            strokeWidth={1.75}
            className="pointer-events-none absolute left-3 top-1/2 z-10 size-[14px] -translate-y-1/2 text-edis-text-4"
          />
          <Input
            type="text"
            inputMode="search"
            placeholder={
              mode === "creatives"
                ? "Buscar por nome da oferta..."
                : "Buscar prompt..."
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                if (query) setQuery("");
                setShowSuggestions(false);
              } else if (e.key === "Enter" && suggestions[0]) {
                router.push(`/drive/${suggestions[0].id}`);
              }
            }}
            className="
              h-9 border-edis-line-2 bg-edis-ink-2 pl-9 pr-9
              text-[13px] placeholder:text-edis-text-4
              focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20
            "
          />
          {query && (
            <button
              type="button"
              aria-label="Limpar busca"
              onClick={() => {
                setQuery("");
                setShowSuggestions(false);
              }}
              className="
                absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center
                justify-center rounded text-edis-text-4 hover:bg-edis-ink-3
                hover:text-foreground
              "
            >
              <Icon icon={Cancel01Icon} size={12} strokeWidth={2} />
            </button>
          )}

          {showSuggestions && suggestions.length > 0 && (
            <ul
              role="listbox"
              className="
                absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden
                rounded-md border border-border bg-popover
                shadow-[0_12px_36px_rgba(0,0,0,0.55)]
              "
            >
              {suggestions.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/drive/${s.id}`}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center gap-2.5 px-3 py-2 transition-colors hover:bg-edis-ink-2"
                  >
                    <div className="flex size-6 shrink-0 items-center justify-center rounded border border-primary/20 bg-primary/10 text-primary">
                      <Icon icon={Folder01Icon} size={12} strokeWidth={1.5} />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[13px] font-medium text-foreground">
                        <Highlight text={s.name} query={query} />
                      </span>
                      <span className="font-mono text-[10.5px] text-edis-text-4">
                        {s.month} {s.year}
                      </span>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] text-edis-text-4">
                      {s.fileCount} arquivos
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-2">
          <FilterSelect
            icon={Calendar01Icon}
            label="Mês"
            value={month}
            onChange={setMonth}
            options={[
              { value: ALL, label: "Todos" },
              ...monthOptions.map((m) => ({ value: m, label: m })),
            ]}
          />
          <FilterSelect
            icon={AlarmClockIcon}
            label="Ano"
            value={year}
            onChange={setYear}
            options={[
              { value: ALL, label: "Todos" },
              ...yearOptions.map((y) => ({ value: y, label: y })),
            ]}
          />
        </div>

        <div className="ml-auto flex items-center gap-0.5 rounded-md border border-edis-line-2 bg-edis-ink-2 p-0.5">
          <ModeToggle
            icon={FolderLibraryIcon}
            label="Criativos"
            active={mode === "creatives"}
            onClick={() => onModeChange("creatives")}
          />
          <ModeToggle
            icon={File02Icon}
            label="Prompts"
            active={mode === "prompts"}
            onClick={() => onModeChange("prompts")}
          />
        </div>
      </div>

      {hasAnyFilter && (
        <p className="text-[12px] text-edis-text-4">
          <span className="font-mono text-edis-text-3">{resultCount}</span>{" "}
          {resultCount === 1 ? "resultado" : "resultados"}
          {query && (
            <>
              {" "}
              para <span className="text-edis-text-2">&ldquo;{query}&rdquo;</span>
            </>
          )}
        </p>
      )}

      {mode === "creatives" ? (
        filteredFolders.length === 0 ? (
          <EmptyState hasFilters={hasAnyFilter} kind="criativo" />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filteredFolders.map((f) => (
              <FolderCard
                key={f.id}
                href={`/drive/${f.id}`}
                name={f.name}
                month={f.month}
                year={f.year}
                fileCount={f.fileCount}
                onShare={() => openDialog(f, "share")}
                onEdit={() => openDialog(f, "edit")}
                onDelete={() => openDialog(f, "delete")}
              />
            ))}
          </div>
        )
      ) : (
        <PromptsGrid prompts={filteredPrompts} hasFilters={hasAnyFilter} />
      )}

      {activeFolder && (
        <>
          <ShareFolderDialog
            open={activeDialog === "share"}
            onOpenChange={(o) => (o ? null : closeDialog())}
            folderId={activeFolder.id}
            folderName={activeFolder.name}
          />
          <EditFolderDialog
            open={activeDialog === "edit"}
            onOpenChange={(o) => (o ? null : closeDialog())}
            folder={activeFolder}
            onSave={(updates) => handleEditFolder(activeFolder.id, updates)}
          />
          <DeleteFolderDialog
            open={activeDialog === "delete"}
            onOpenChange={(o) => (o ? null : closeDialog())}
            name={activeFolder.name}
            fileCount={activeFolder.fileCount}
            onConfirm={() => handleDeleteFolder(activeFolder.id)}
          />
        </>
      )}
    </div>
  );
}

function PromptsGrid({
  prompts,
  hasFilters,
}: {
  prompts: PromptItem[];
  hasFilters: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {prompts.length === 0 ? (
        <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
          <EmptyState hasFilters={hasFilters} kind="prompt" />
        </div>
      ) : (
        prompts.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} />)
      )}
    </div>
  );
}

function PromptCard({ prompt }: { prompt: PromptItem }) {
  return (
    <article className="group relative flex min-h-[230px] flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-colors duration-150 hover:border-edis-line-3 hover:bg-edis-ink-2">
      <div className="flex items-start justify-between gap-3">
        <GreenIcon icon={File02Icon} />
        <div
          className="
            pointer-events-none flex items-center gap-1 opacity-0 transition-opacity duration-150
            group-hover:pointer-events-auto group-hover:opacity-100
            focus-within:pointer-events-auto focus-within:opacity-100
          "
        >
          <PromptAction label="Visualizar" icon={ViewIcon} />
          <PromptAction label="Copiar" icon={Copy01Icon} />
          <PromptAction label="Editar" icon={PencilEdit01Icon} />
          <PromptAction label="Excluir" icon={Delete02Icon} destructive />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-1">
          <h3 className="line-clamp-2 text-[13.5px] font-medium leading-tight text-foreground">
            {prompt.title}
          </h3>
          <p className="line-clamp-2 text-[12.5px] leading-[1.5] text-edis-text-3">
            {prompt.description}
          </p>
        </div>
        <div
          className="
            line-clamp-4 rounded-md border border-edis-line-2 bg-edis-ink-2
            bg-[linear-gradient(to_bottom,transparent_0,transparent_23px,rgba(255,255,255,0.04)_24px)]
            bg-[length:100%_24px] p-3 font-mono text-[10.5px] leading-6 text-edis-text-4
          "
        >
          {prompt.prompt}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-md border border-edis-line-2 bg-edis-ink-2 px-2 py-0.5 font-mono text-[10.5px] font-medium text-edis-text-3">
          {prompt.attachmentCount} anexos
        </span>
        <span className="rounded-md border border-edis-line-2 bg-edis-ink-2 px-2 py-0.5 font-mono text-[10.5px] font-medium text-edis-text-3">
          {prompt.updatedAt}
        </span>
      </div>
    </article>
  );
}

function PromptAction({
  label,
  icon,
  destructive = false,
}: {
  label: string;
  icon: typeof ViewIcon;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
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

function GreenIcon({
  icon,
}: {
  icon: typeof FolderLibraryIcon;
}) {
  return (
    <div
      className="
        flex size-10 items-center justify-center rounded-lg
        border border-primary/15 bg-primary/10 p-[3px]
      "
    >
      <div
        className="
          flex h-full w-full items-center justify-center rounded-md
          bg-gradient-to-br from-[#007F3E] to-[#00572B] text-white
          shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_2px_6px_rgba(0,229,115,0.18)]
        "
      >
        <Icon icon={icon} size={18} strokeWidth={2.25} className="size-[18px]" />
      </div>
    </div>
  );
}

function FilterSelect({
  icon,
  label,
  value,
  onChange,
  options,
}: {
  icon: typeof Calendar01Icon;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const active = value !== ALL;
  const selectedLabel = options.find((o) => o.value === value)?.label ?? label;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        data-size="default"
        className={cn(
          "h-9 gap-2 rounded-md border-edis-line-2 bg-edis-ink-2 px-3 text-[13px]",
          active ? "text-foreground" : "text-edis-text-2",
          "hover:bg-edis-ink-3 hover:text-foreground",
          "focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20"
        )}
      >
        <Icon
          icon={icon}
          size={18}
          strokeWidth={1.75}
          className={cn(
            "size-[18px]",
            active ? "text-primary" : "text-edis-text-2"
          )}
        />
        <SelectValue placeholder={label}>
          {active ? selectedLabel : label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="border-border bg-popover">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-[13px]">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ModeToggle({
  icon,
  label,
  active,
  onClick,
}: {
  icon: typeof FolderLibraryIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={
        active
          ? "flex size-8 items-center justify-center rounded bg-primary/15 text-primary transition-colors"
          : "flex size-8 items-center justify-center rounded text-edis-text-3 transition-colors hover:bg-edis-ink-3 hover:text-foreground"
      }
    >
      <Icon icon={icon} size={18} strokeWidth={1.75} className="size-[18px]" />
    </button>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-primary">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

function EmptyState({
  hasFilters,
  kind,
}: {
  hasFilters: boolean;
  kind: "criativo" | "prompt";
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-10 text-center">
      <span className="edis-tag">Nenhum resultado</span>
      <p className="max-w-sm text-[13px] text-edis-text-3">
        {hasFilters
          ? "Nada bate com os filtros aplicados. Tente limpar a busca ou mudar o mês/ano."
          : kind === "prompt"
            ? "Nenhum prompt salvo ainda. Use o botão Novo Prompt para começar."
            : "Nenhuma pasta ainda. Use o botão Nova Pasta acima para começar."}
      </p>
    </div>
  );
}
