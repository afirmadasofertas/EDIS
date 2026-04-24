import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft02Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { UploadFilesDialog } from "@/components/shared/upload-files-dialog";
import { getFolderById, getFolderFiles } from "../_data";
import { FilesGrid } from "./_grid";

type PageProps = {
  params: Promise<{ folderId: string }>;
};

export default async function FolderDetailPage({ params }: PageProps) {
  const { folderId } = await params;
  const folder = getFolderById(folderId);

  if (!folder) notFound();

  const files = getFolderFiles(folderId);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/drive"
            aria-label="Voltar para Drive"
            className="
              mt-1 flex size-8 shrink-0 items-center justify-center rounded-md
              border border-edis-line-2 bg-edis-ink-2 text-edis-text-2
              transition-colors duration-150
              hover:border-edis-line-3 hover:bg-edis-ink-3 hover:text-foreground
            "
          >
            <Icon
              icon={ArrowLeft02Icon}
              size={16}
              strokeWidth={1.75}
              className="size-[16px]"
            />
          </Link>
          <div className="flex flex-col gap-1">
            <h1
              className="font-display text-[26px] font-medium leading-[1.15] tracking-tight text-foreground"
              style={{ letterSpacing: "-0.025em" }}
            >
              {folder.name}
            </h1>
            <p className="text-[13px] text-edis-text-3">
              {folder.month} {folder.year}
              <span className="mx-2 text-edis-text-4">·</span>
              <span className="font-mono text-[11.5px] text-edis-text-4">
                {folder.fileCount} arquivos
              </span>
            </p>
          </div>
        </div>

        <UploadFilesDialog
          trigger={
            <Button
              size="sm"
              className="
                h-9 gap-2 self-start rounded-md bg-primary px-3.5
                text-[13px] font-medium text-primary-foreground
                hover:bg-[#33eb8c]
                sm:self-auto
              "
            >
              <Icon
                icon={Upload01Icon}
                size={16}
                strokeWidth={2}
                className="size-[16px]"
              />
              Upload de Arquivos
            </Button>
          }
        />
      </header>

      {/* Files grid/list + dialogs (client-side state inside). */}
      <FilesGrid initialFiles={files} />
    </div>
  );
}
