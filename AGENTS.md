<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:edis-icon-rules -->
# Icons: Hugeicons only

This project uses **[Hugeicons](https://hugeicons.com/) (free tier) as the single icon library.** Lucide, Phosphor, Solar, Heroicons, etc. are explicitly **not used** — the design system (`EDIS_Design_System/README.md → ICONOGRAPHY`) prescribes Hugeicons.

When adding an icon:

1. Import the icon **data** from `@hugeicons/core-free-icons` (e.g. `import { Home01Icon } from "@hugeicons/core-free-icons"`).
2. Render it via the app wrapper: `<Icon icon={Home01Icon} />` from `@/components/icon` — defaults are stroke 1.5, size 18, `shrink-0`, inherits `currentColor`.
3. Inside shadcn primitives that already exist (`sheet.tsx`, `sidebar.tsx`, `dropdown-menu.tsx`), use `<HugeiconsIcon>` directly so the file stays self-contained.
4. **Prefer the `01` variant** of every icon whenever it exists (family consistency). Drop the numeric suffix only when Hugeicons doesn't offer a `01` form (e.g. `UserIcon`, `CreditCardIcon`, `MoneySecurityIcon`).

When running `npx shadcn@latest add <component>`, the CLI may reinstall `lucide-react` because some shadcn components import it. If that happens:

1. `grep -rn "lucide-react" app components` — find every new usage.
2. Swap each to its Hugeicons equivalent (probe names with the script pattern under `@hugeicons/core-free-icons`).
3. `npm uninstall lucide-react` to keep the dependency tree honest.

Common Hugeicons names we already use (don't reinvent): `Home01Icon`, `DashboardSquare01Icon`, `MagicWand01Icon`, `OrthogonalEdgeIcon`, `Image02Icon`, `Atom02Icon`, `GlobalSearchIcon`, `Books01Icon`, `Folder01Icon`, `Mortarboard01Icon`, `Settings01Icon`, `Notification01Icon`, `Search01Icon`, `ArrowRight01Icon`, `Tick01Icon`, `Cancel01Icon`, `LayoutLeftIcon`, `UserIcon`, `MoneySecurityIcon`, `LogoutSquare02Icon`.
<!-- END:edis-icon-rules -->
