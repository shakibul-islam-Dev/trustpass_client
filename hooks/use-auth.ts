"use client";

import { useSession } from "@/lib/auth-client";
import type { UserRole } from "@/lib/sidebarData";

export function useAuth() {
  const { data: session, isPending, error } = useSession();

  const user = session?.user;
  const role = (user?.role as UserRole) || "user";

  return {
    user,
    role,
    session,
    isPending,
    isAuthenticated: !!session?.user,
    error,
  };
}