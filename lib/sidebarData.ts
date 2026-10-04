import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  User,
  Shield,
  Flag,
  Scale,
  Factory,
  BellIcon,
  FolderTree,
} from "lucide-react";

export const roleSidebars = {
  admin: {
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
        name: "Bussiness",
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
      { name: "Categories", href: "/dashboard/admin/categories", icon: FolderTree },
      { name: "System Settings", href: "/admin/settings", icon: Settings },
    ],
  },
  moderator: {
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

    ],
  },
  merchant: {
    title: "Merchant Workspace",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Analytics", href: "/dashboard/analytics", icon: FileText },
      { name: "Invoice", href: "/dashboard/invoice", icon: FileText },
      { name: "Products", href: "/dashboard/products", icon: FileText },
      { name: "Reports", href: "/dashboard/reports", icon: FileText },
      { name: "Messages", href: "/dashboard/messages", icon: FileText },
      {
        name: "Notifications",
        href: "/dashboard/notifications",
        icon: FileText,
      },
      { name: "Settings", href: "/dashboard/settings", icon: FileText },
    ],
  },
  user: {
    title: "user",
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
      { name: "Profile Settings", href: "/dashboard/profile", icon: User },
    ],
  },
};

export type UserRole = keyof typeof roleSidebars;

// ============================================================
// Better Auth Role → Sidebar Key mapping
// ============================================================
export const mapAuthRoleToSidebarRole = (
  authRole: string | undefined | null
): UserRole => {
  switch (authRole?.toUpperCase()) {
    case "ADMIN":
      return "admin";
    case "MODERATOR":
      return "moderator";
    case "BUYER":
      return "merchant";
    case "CUSTOMER":
    default:
      return "user";
  }
};