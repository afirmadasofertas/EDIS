"use client";

import { usePathname } from "next/navigation";
import { Notification01Icon, Search01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Icon } from "@/components/icon";
import { PAGE_TITLES } from "./nav-items";

export function Topbar() {
  const pathname = usePathname() ?? "/dashboard";
  const title =
    PAGE_TITLES[pathname] ??
    Object.entries(PAGE_TITLES).find(([href]) =>
      pathname.startsWith(href)
    )?.[1] ??
    "Workspace";

  return (
    <header
      className="
        sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border
        bg-background/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/60
      "
    >
      <SidebarTrigger className="-ml-1 size-8 text-edis-text-3 hover:text-foreground" />
      <Separator
        orientation="vertical"
        className="mx-1 !h-full w-px bg-border"
      />

      <div className="flex min-w-0 items-center gap-2">
        <span className="edis-eyebrow hidden sm:inline">Workspace</span>
        <span className="hidden text-edis-text-4 sm:inline">/</span>
        <h1
          className="truncate font-display text-[15px] font-medium tracking-tight text-foreground"
          style={{ letterSpacing: "-0.015em" }}
        >
          {title}
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="
            h-8 gap-2 rounded-md border-edis-line-2 bg-edis-ink-2
            px-2.5 text-[12.5px] font-normal text-edis-text-3
            hover:bg-edis-ink-3 hover:text-foreground
          "
        >
          <Icon icon={Search01Icon} size={14} />
          <span className="hidden md:inline">Search</span>
          <kbd className="ml-2 hidden items-center gap-0.5 rounded border border-edis-line-2 bg-edis-ink-0 px-1.5 py-0.5 font-mono text-[10px] text-edis-text-3 md:inline-flex">
            <span className="text-[11px]">⌘</span>K
          </kbd>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-edis-text-3 hover:bg-edis-ink-2 hover:text-foreground"
          aria-label="Notifications"
        >
          <Icon icon={Notification01Icon} size={16} />
        </Button>
      </div>
    </header>
  );
}
