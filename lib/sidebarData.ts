import {
  LayoutDashboard,
  Users,
<<<<<<< HEAD
=======
  Settings,
>>>>>>> ab474f7 (Save local changes)
  BarChart3,
  FileText,
  UserCheck,
  ShoppingBag,
  User,
<<<<<<< HEAD
  Shield,
  Flag,
  Scale
} from 'lucide-react';
=======
} from "lucide-react";
>>>>>>> ab474f7 (Save local changes)

export const roleSidebars = {
  admin: {
    title: "Admin",
    items: [
<<<<<<< HEAD
      { name: 'Admin Overview', href: '/dashboard/admin', icon: LayoutDashboard },
      { name: 'User Management', href: '/dashboard/admin/user-management', icon: Users },
      { name: 'Verification Queue', href: '/dashboard/admin/verification-queue', icon: Shield   },
      { name: 'Reports Review', href: '/dashboard/admin/reports', icon: Flag   },
       { name: 'Trust Rules', href: '/dashboard/admin/trust-rules', icon: Scale   },
=======
      { name: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "User Control", href: "/admin/users", icon: Users },
      { name: "System Settings", href: "/admin/settings", icon: Settings },
>>>>>>> ab474f7 (Save local changes)
    ],
  },
  manager: {
    title: "Moderator",
    items: [
      { name: "Manager Stats", href: "/manager", icon: BarChart3 },
      { name: "Team Performance", href: "/manager/team", icon: UserCheck },
      { name: "Reports", href: "/manager/reports", icon: FileText },
    ],
  },
  seller: {
    title: "Seller Workspace",
    items: [
      { name: "Content Dashboard", href: "/editor", icon: LayoutDashboard },
      { name: "All Articles", href: "/editor/articles", icon: FileText },
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
