"use client";

import { roleLabel, type ApiRole } from "@/lib/core/roles";

export default function DashboardRoleLabel({
  role,
  label,
}: {
  role: ApiRole;
  label?: string;
}) {
  return (
    <span className="text-sm font-semibold capitalize text-foreground">
      {label ?? roleLabel(role)}
    </span>
  );
}
