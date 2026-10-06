"use client";

import { roleLabel, type ApiRole } from "@/lib/core/roles";

/**
 * Shows the signed-in user's role.
 *
 * Takes the role straight from the session. The previous version called
 * `usePathname()` and picked a label out of the URL, so the header claimed a
 * role based on which page happened to be open — including showing "customer"
 * to someone standing on the admin overview.
 */
export default function DashboardRoleLabel({ role }: { role: ApiRole }) {
  return (
    <span className="text-sm font-semibold capitalize text-foreground">
      {roleLabel(role)}
    </span>
  );
}