import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  FileText,
  UserCheck,
  ShoppingBag,
  User,
  Shield,
  Flag,
  Scale,
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
      {
        name: "Trust Rules & Score",
        href: "/dashboard/moderator/trust-rules",
        icon: Scale,
      },
    ],
  },
  manager: {
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
        name: "Trust Rules & Score",
        href: "/dashboard/moderator/trust-rules",
        icon: Scale,
      },
    ],
  },
  seller: {
    title: "Seller Workspace",
    items: [
      { name: "Content Dashboard", href: "/editor", icon: LayoutDashboard },
      { name: "All Articles", href: "/editor/articles", icon: FileText },
    ],
  },
  user: {
    title: "User Area",
    items: [
      { name: "My Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "My Orders", href: "/dashboard/orders", icon: ShoppingBag },
      { name: "Profile Settings", href: "/dashboard/profile", icon: User },
    ],
  },
};

export type UserRole = keyof typeof roleSidebars;
