import DashboardSideBar from "@/components/dashboard/DashboardSideBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserRole } from "@/lib/sidebarData";
import { Shield } from "lucide-react";

export default function DashboardRootlayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userRole: UserRole = "admin";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        {/* Responsive Sidebar */}
        <DashboardSideBar userRole={userRole} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
          {/* Top Navbar Header */}
          <header className="flex items-center justify-between border-b border-border px-4 md:px-6 py-3 bg-card sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Dashboard</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm font-semibold capitalize text-foreground">{userRole}</span>
              </div>
            </div>
          </header>

          {/* Main Dashboard Content */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-muted/20">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}