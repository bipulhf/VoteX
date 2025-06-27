import DashboardSidebar from "@/components/dashboard/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("role")?.value === "ADMIN";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar isAdmin={isAdmin} />
        <div className="flex flex-1 flex-col w-full min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6 w-full">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-4 md:p-6 w-full">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
