import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  UserCheck,
  ShoppingBag,
  User,
  Shield
} from 'lucide-react';

export const roleSidebars = {
  admin: {
    title: 'Admin',
    items: [
      { name: 'Admin Overview', href: '/dashboard/admin', icon: LayoutDashboard },
      { name: 'User Management', href: '/dashboard/admin/user-management', icon: Users },
      { name: 'Verification Queue', href: '/dashboard/admin/verification-queue', icon: Shield   },
    ],
  },
  manager: {
    title: 'Moderator',
    items: [
      { name: 'Manager Stats', href: '/manager', icon: BarChart3 },
      { name: 'Team Performance', href: '/manager/team', icon: UserCheck },
      { name: 'Reports', href: '/manager/reports', icon: FileText },
    ],
  },
  seller: {
    title: 'Seller Workspace',
    items: [
      { name: 'Content Dashboard', href: '/editor', icon: LayoutDashboard },
      { name: 'All Articles', href: '/editor/articles', icon: FileText },
    ],
  },
  user: {
    title: 'User Area',
    items: [
      { name: 'My Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'My Orders', href: '/dashboard/orders', icon: ShoppingBag },
      { name: 'Profile Settings', href: '/dashboard/profile', icon: User },
    ],
  },
};

export type UserRole = keyof typeof roleSidebars;