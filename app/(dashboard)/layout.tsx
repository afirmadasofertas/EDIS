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
          <main
            className={
              isEditor
                ? "flex-1 overflow-hidden"
                : // Extra pt-8/pt-12 so page headers don't bleed through the
                  // topbar's bg-background/80 backdrop-blur.
                  "flex-1 px-6 pb-6 pt-8 lg:px-8 lg:pb-8 lg:pt-12"
            }
          >
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  );
}
