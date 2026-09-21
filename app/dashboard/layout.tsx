import DashboardSideBar from "@/components/dashboard/DashboardSideBar";
import { UserRole } from "@/lib/sidebarData";

export default function DashboardRootlayout({
  children,
}: LayoutProps<"/dashboard">) {
  const userRole: UserRole = "admin";
  return (
    <div className="min-h-full flex flex-col">
      <DashboardSideBar userRole={userRole}></DashboardSideBar>

      <main className="flex-1 p-8 bg-slate-50">{children}</main>
    </div>
  );
}
