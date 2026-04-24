import type { IconSvgElement } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  OrthogonalEdgeIcon,
  Image02Icon,
  SaturnIcon,
  GlobalSearchIcon,
  HardDriveIcon,
  Mortarboard02Icon,
  Coins01Icon,
  Settings01Icon,
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
      { href: "/space", label: "Space", icon: OrthogonalEdgeIcon, badge: "BETA" },
      { href: "/editor", label: "Editor", icon: Image02Icon },
      { href: "/crow-ai", label: "CrowAI", icon: SaturnIcon },
    ],
  },
  {
    label: "Library",
    items: [
      { href: "/swipe-files", label: "Swipe files", icon: GlobalSearchIcon },
      { href: "/drive", label: "Drive", icon: HardDriveIcon },
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

export const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/space": "Space",
  "/editor": "Editor",
  "/crow-ai": "CrowAI",
  "/swipe-files": "Swipe files",
  "/drive": "Drive",
  "/aulas": "Aulas",
  "/usage": "Usage",
  "/settings": "Configurações",
};
