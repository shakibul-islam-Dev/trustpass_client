"use client";

import DashboardSideBar from "@/components/dashboard/DashboardSideBar";
import DashboardRoleLabel from "@/components/dashboard/DashboardRoleLabel";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function DashboardRootlayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, isPending, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/login");
        },
      },
    });
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/auth/login");
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        {/* Responsive Sidebar */}
        <DashboardSideBar userRole={role} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
          {/* Top Navbar Header */}
          <header className="flex items-center justify-between border-b border-border px-4 md:px-6 py-3 bg-card sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Dashboard</span>
                <span className="text-muted-foreground">/</span>
                <DashboardRoleLabel fallbackRole={role} />
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
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