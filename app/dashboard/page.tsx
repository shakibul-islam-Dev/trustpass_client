"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { homeForRole } from "@/lib/core/roles";

/**
 * `/dashboard` itself.
 *
 * There is no page to show here — it exists only so signing in can send people
 * to a stable URL, and so the parent layout has something to redirect. Each
 * role has its own landing page, so this hands off immediately.
 */
export default function DashboardIndexPage() {
  const router = useRouter();
  const { role, isPending, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isPending) return;

    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }

    router.replace(homeForRole(role));
  }, [isPending, isAuthenticated, role, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-sm text-muted-foreground">
        {isPending ? "Loading..." : "Taking you to your dashboard..."}
      </div>
    </div>
  );
}