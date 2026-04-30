import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { UserProvider } from "@/components/providers/user-provider";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const pathname = (await headers()).get("x-pathname") ?? "";
  const isEditor = pathname.startsWith("/editor");

  // Respect the user's last sidebar preference on regular pages, but always
  // force collapsed on /editor for the full-canvas experience. Cookie name
  // is set by SidebarProvider when the user toggles.
  const sidebarOpenCookie =
    (await cookies()).get("sidebar_state")?.value !== "false";
  const defaultOpen = isEditor ? false : sidebarOpenCookie;

  return (
    <UserProvider user={user}>
      <SidebarProvider
        // Force remount when crossing the editor boundary so defaultOpen
        // takes effect — SidebarProvider only reads it on first useState.
        key={isEditor ? "editor" : "default"}
        defaultOpen={defaultOpen}
        style={
          {
            "--sidebar-width": "15rem",
            "--sidebar-width-icon": "3.25rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset className="bg-background">
          <Topbar />
          {/* Uniform padding for every dashboard page. /editor escapes
              this via its own nested layout so the conditional doesn't
              live here. */}
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  );
}
