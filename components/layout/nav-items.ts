import type { IconSvgElement } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Image02Icon,
  SaturnIcon,
  MagicWand01Icon,
  HardDriveIcon,
  Mortarboard02Icon,
  Coins01Icon,
  Settings01Icon,
  GlobalSearchIcon,
} from "@hugeicons/core-free-icons";

// Hugeicons exports icon data (readonly SVG path arrays), not React components.
// Consumed via <HugeiconsIcon icon={...} /> or our <Icon /> wrapper.
export type NavIcon = IconSvgElement;

export type NavItem = {
  href: string;
  label: string;
  icon: NavIcon;
  badge?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: DashboardSquare01Icon },
      { href: "/editor", label: "Editor", icon: Image02Icon },
      { href: "/crow-ai", label: "CrowAI", icon: SaturnIcon },
    ],
  },
  {
    label: "Library",
    items: [
      { href: "/swipe-files", label: "Gerador", icon: MagicWand01Icon },
      { href: "/drive", label: "Drive", icon: HardDriveIcon },
      { href: "/referencias", label: "Referências", icon: GlobalSearchIcon },
      { href: "/aulas", label: "Aulas", icon: Mortarboard02Icon },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/usage", label: "Usage", icon: Coins01Icon },
      { href: "/settings", label: "Configurações", icon: Settings01Icon },
    ],
  },
];

/**
 * Returns the group label (Workspace / Library / Account) the given pathname
 * belongs to — used by the topbar to render a dynamic breadcrumb eyebrow.
 */
export function getGroupForPath(pathname: string | null): string {
  if (!pathname) return NAV_GROUPS[0]?.label ?? "Workspace";
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
        return group.label;
      }
    }
  }
  return NAV_GROUPS[0]?.label ?? "Workspace";
}

export const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/editor": "Editor",
  "/crow-ai": "CrowAI",
  "/swipe-files": "Gerador",
  "/drive": "Drive",
  "/referencias": "Referências",
  "/aulas": "Aulas",
  "/usage": "Usage",
  "/settings": "Configurações",
};
