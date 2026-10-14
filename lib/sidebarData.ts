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
  Bell,
  CreditCard,
  BarChart3,
  Package,
  ShoppingBag,
  ShieldCheck,
  ShoppingBagIcon,
} from "lucide-react";
import type { ApiRole } from "@/lib/core/roles";

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
        name:'All Products',
        href: '/dashboard/admin/products',
        icon: ShoppingBagIcon
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
        name: "Notifications",
        href: "/dashboard/admin/notifications",
        icon: Bell,
      },
      {
  name: "Payments",
  href: "/dashboard/admin/payments",
  icon: CreditCard,
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
      // all perferct

      {
        name: "Reports Review",
        href: "/dashboard/moderator/reports",
        icon: Flag,
      },
      {
        name: "Notifications",
        href: "/dashboard/moderator/notifications",
        icon: Bell,
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
        name:"Analytics",
        href: "/dashboard/seller/analytics",
        icon: BarChart3,
      },
      {
        name: "My Products",
        href: "/dashboard/seller/products",
        icon: Package,

      },
      {
        name: "Orders",
        href: "/dashboard/seller/orders",
        icon: ShoppingBag,
      },
      {
        name: "Payments",
        href: "/dashboard/seller/payments",
        icon: CreditCard,
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
        name: "Settings",
        href: "/dashboard/seller/settings",
        icon: Settings,
      },
      {
        name: "Verification",
        href: "/dashboard/seller/settings/verification",
        icon: ShieldCheck,
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


export type UserRole = ApiRole;

export { Settings };

