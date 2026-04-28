import { headers } from "next/headers";
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

  return (
    <UserProvider user={user}>
      <SidebarProvider
        defaultOpen={!isEditor}
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
                : "flex-1 p-6 lg:p-8"
            }
          >
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  );
}
