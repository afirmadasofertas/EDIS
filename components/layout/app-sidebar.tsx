"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogoutSquare02Icon,
  UserIcon,
  CreditCardIcon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/icon";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { EdisLogo } from "./edis-logo";
import { NAV_GROUPS } from "./nav-items";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar"
    >
      <SidebarHeader
        className="
          h-14 flex-row items-center border-b border-sidebar-border
          px-3
          group-data-[collapsible=icon]:justify-center
          group-data-[collapsible=icon]:px-2
        "
      >
        <Link
          href="/dashboard"
          aria-label="EDIS dashboard"
          className="
            group/edis-logo flex h-9 items-center rounded-md
            px-1.5
            group-data-[collapsible=icon]:size-9
            group-data-[collapsible=icon]:justify-center
            group-data-[collapsible=icon]:px-0
          "
        >
          {/* Lockup (raven + EDIS wordmark) — expanded state. */}
          <EdisLogo
            variant="lockup"
            size={26}
            className="group-data-[collapsible=icon]:hidden"
          />
          {/* Mark-only (inline SVG — sparkles twinkle on hover). */}
          <EdisLogo
            variant="mark"
            size={22}
            className="hidden group-data-[collapsible=icon]:block"
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0 py-3">
        {NAV_GROUPS.map((group, i) => (
          <SidebarGroup key={group.label} className="py-2">
            {i > 0 && (
              <SidebarSeparator className="-mx-2 mb-2 bg-sidebar-border group-data-[collapsible=icon]:mx-0" />
            )}
            <SidebarGroupLabel className="edis-eyebrow px-2 text-[10px] text-edis-text-4 group-data-[collapsible=icon]:hidden">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname?.startsWith(`${item.href}/`);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.label}
                        className="
                          h-9 gap-2.5 rounded-md text-[13.5px] font-medium
                          text-sidebar-foreground
                          transition-colors duration-150
                          [&_svg]:!size-[18px] [&_svg]:transition-colors [&_svg]:duration-150
                          hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                          hover:[&_svg]:text-primary
                          data-[active=true]:bg-sidebar-accent
                          data-[active=true]:text-sidebar-accent-foreground
                          data-[active=true]:border data-[active=true]:border-sidebar-border
                          data-[active=true]:[&_svg]:text-primary
                          data-[active=true]:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
                        "
                      >
                        <Link href={item.href}>
                          <Icon icon={item.icon} />
                          <span className="group-data-[collapsible=icon]:hidden">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="ml-auto rounded-sm border border-edis-line-2 bg-edis-ink-3 px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-[0.14em] text-edis-text-3 group-data-[collapsible=icon]:hidden">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-12 gap-3 rounded-md px-2 data-[state=open]:bg-sidebar-accent"
                  tooltip="Account"
                >
                  <Avatar className="size-8 rounded-md border border-sidebar-border">
                    <AvatarFallback className="rounded-md bg-edis-ink-3 font-mono text-[11px] font-medium text-edis-text-1">
                      MV
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col overflow-hidden text-left group-data-[collapsible=icon]:hidden">
                    <span className="truncate text-[13px] font-medium text-sidebar-foreground">
                      Marcos Viana
                    </span>
                    <span className="truncate font-mono text-[10.5px] text-edis-text-4">
                      marcos@edis.app
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="end"
                className="min-w-56 rounded-md border-border bg-popover"
              >
                <DropdownMenuLabel className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-edis-text-4">
                  User
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-[13px]">
                  <Icon icon={UserIcon} size={16} />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-[13px]">
                  <Icon icon={CreditCardIcon} size={16} />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-[13px] text-edis-text-2">
                  <Icon icon={LogoutSquare02Icon} size={16} />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
