"use client";

import { roleSidebars, UserRole } from "@/lib/sidebarData";
import { usePathname } from "next/navigation";

interface SidebarProps {
  userRole: UserRole;
}

export default function DashboardSideBar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  const currentSidebar = roleSidebars[userRole] || roleSidebars.user;

  return <aside> create your sidebar </aside>;
}
