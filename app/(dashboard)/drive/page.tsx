import { Add01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { NewFolderDialog } from "@/components/shared/new-folder-dialog";
import { DriveBrowser } from "./_browser";
import { NotificationsButton } from "./_notifications-button";
import { SAMPLE_FOLDERS } from "./_data";

export default function DrivePage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="edis-tag">Drive</span>
          <h1
            className="font-display text-[30px] font-medium leading-[1.1] tracking-tight text-foreground"
            style={{ letterSpacing: "-0.025em" }}
          >
            Drive Criativos
          </h1>
          <p className="text-[14px] leading-[1.55] text-edis-text-3">
            Gerencie seus arquivos de criativos.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <NotificationsButton />
          <NewFolderDialog
            trigger={
              <Button
                size="sm"
                className="
                  h-9 gap-2 rounded-md bg-primary px-3.5
                  text-[13px] font-medium text-primary-foreground
                  hover:bg-[#33eb8c]
                "
              >
                <Icon
                  icon={Add01Icon}
                  size={16}
                  strokeWidth={2}
                  className="size-[16px]"
                />
                Nova Pasta
              </Button>
            }
          />
        </div>
      </header>

      {/* Interactive browser — search / filters / view toggle / results */}
      <DriveBrowser folders={SAMPLE_FOLDERS} />
    </div>
  );
}
