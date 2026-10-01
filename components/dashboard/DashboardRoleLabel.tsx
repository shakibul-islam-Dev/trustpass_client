"use client";

import { usePathname } from "next/navigation";
import type { UserRole } from "@/lib/sidebarData";

type DashboardRoleLabelProps = {
  fallbackRole: UserRole;
};

export default function DashboardRoleLabel({ fallbackRole }: DashboardRoleLabelProps) {
  const pathname = usePathname();
  const role: UserRole = pathname.startsWith("/dashboard/moderator")
    ? "moderator"
    : pathname.startsWith("/dashboard/customer")
      ? "user"
      : pathname.startsWith("/dashboard/merchant")
        ? "merchant"
        : fallbackRole;

  return (
    <span className="text-sm font-semibold capitalize text-foreground">
      {role}
    </span>
  );
}