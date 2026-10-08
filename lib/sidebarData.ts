import {
  LayoutDashboard,
  Users,
  Settings,
  Flag,
  User,
  Shield,
  Scale,
  Factory,
  BellIcon,
  FolderTree,
  Key,
} from "lucide-react";
import type { ApiRole } from "@/lib/core/roles";

/**
 * Sidebar contents per role.
 *
 * Keyed by the API role directly. The previous version was keyed by a mix of
 * `admin`/`moderator`/`merchant`/`user`/`CUSTOMER`/`SELLER` and needed a
 * separate mapping table in `use-auth.ts` to bridge the two, which is where
 * mismatches crept in.
 *
 * Every `href` here is a route that exists under `app/dashboard`. The old
 * table pointed at `/dashboard/merchant`, `/dashboard/analytics`,
 * `/dashboard/products`, `/dashboard/settings`, `/admin/settings` and
 * `/dashboard/profile` — none of which were ever built, so those links all
 * landed on a 404.
 */
export const roleSidebars: Record<ApiRole, { title: string; items: SidebarItem[] }> = {
  ADMIN: {
    title: "Admin",
    items: [
      {
        name: "Admin Overview",
        href: "/dashboard/admin",
        icon: LayoutDashboard,
      },
      {
        name: "User Management",
        href: "/dashboard/admin/user-management",
        icon: Users,
      },
      {
        name: "Businesses",
        href: "/dashboard/admin/businesses",
        icon: Factory,
      },
      {
        name: "Verification Queue",
        href: "/dashboard/admin/verification-queue",
        icon: Shield,
      },
      { name: "Reports Review", href: "/dashboard/admin/reports", icon: Flag },
      {
        name: "Trust Rules",
        href: "/dashboard/admin/trust-rules",
        icon: Scale,
      },
      {
        name: "Categories",
        href: "/dashboard/admin/categories",
        icon: FolderTree,
      },
      {
        name: "Change Password",
        href: "/dashboard/change-password",
        icon: Key,
      },
    ],
  },

  MODERATOR: {
    title: "Moderator",
    items: [
      {
        name: "Moderator Overview",
        href: "/dashboard/moderator",
        icon: LayoutDashboard,
      },
      {
        name: "Verification Queue",
        href: "/dashboard/moderator/verification-queue",
        icon: Shield,
      },
      {
        name: "Reports Review",
        href: "/dashboard/moderator/reports",
        icon: Flag,
      },
      {
        name: "Change Password",
        href: "/dashboard/change-password",
        icon: Key,
      },
    ],
  },

  SELLER: {
    title: "Seller",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard/seller",
        icon: LayoutDashboard,
      },
      {
        name: "My Reports",
        href: "/dashboard/customer/reports",
        icon: Flag,
      },
      {
        name: "Notifications",
        href: "/dashboard/customer/notifications",
        icon: BellIcon,
      },
      {
        name: "Change Password",
        href: "/dashboard/change-password",
        icon: Key,
      },
    ],
  },

  CUSTOMER: {
    title: "Customer",
    items: [
      {
        name: "My Dashboard",
        href: "/dashboard/customer",
        icon: LayoutDashboard,
      },
      {
        name: "My Reports",
        href: "/dashboard/customer/reports",
        icon: Flag,
      },
      {
        name: "Notifications",
        href: "/dashboard/customer/notifications",
        icon: BellIcon,
      },
      {
        name: "Profile Settings",
        href: "/dashboard/customer/profile",
        icon: User,
      },
      {
        name: "Change Password",
        href: "/dashboard/change-password",
        icon: Key,
      },
    ],
  },
};

export type SidebarItem = {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
};

/**
 * Kept as a named type for callers that used to pass `UserRole` around. This is
 * the API role now — there is no second naming scheme to translate from.
 */
export type UserRole = ApiRole;
/** Settings icon kept exported so a future settings page can reuse the import. */
export { Settings };
// export { Settings };
