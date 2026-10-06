"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import DashboardSideBar from "@/components/dashboard/DashboardSideBar";
import DashboardRoleLabel from "@/components/dashboard/DashboardRoleLabel";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/core/session";
import { canAccessDashboardPath, homeForRole } from "@/lib/core/roles";

/**
 * Gate for everything under /dashboard.
 *
 * Two checks, both from the session (never from the URL):
 *   1. signed in at all
 *   2. this role may view this subtree
 *
 * A role that may not see the current page is sent to its own home rather than
 * shown a 403, because reaching a URL by typing it is not a normal thing to do
 * and the server would reject the data anyway.
 *
 * This is UX, not security — see the note at the top of `lib/core/roles.ts`.
 */
export default function DashboardRootlayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, user, isPending, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect in an effect, never during render. Calling router.push() while
  // rendering makes React warn ("Cannot update a component (Router) while
  // rendering a different component") and the navigation is not guaranteed to
  // be committed before the next render.
  useEffect(() => {
    // Still asking the server who this is — wait for the answer instead of
    // guessing.
    //
    // This used to be `if (isPending || !isAuthenticated)`, which treated
    // "loading" the same as "signed out". Right after verifying an OTP the
    // client navigates here while `useAuth` is still on its first fetch, so
    // `isPending` was true, this effect fired, and the user was bounced to
    // /auth/login even though the server had just signed them in. The fix is
    // to let the pending state finish first, which is what
    // `app/dashboard/page.tsx` already does for the same reason.
    if (isPending) return;

    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }

    // `/dashboard` has no page of its own; bounce to this role's home.
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      router.replace(homeForRole(role));
      return;
    }

    if (!canAccessDashboardPath(pathname, role)) {
      router.replace(homeForRole(role));
    }
  }, [isPending, isAuthenticated, pathname, role, router]);

  const handleSignOut = async () => {
    // Navigate back to login even if the revoke call failed — the cookie is
    // httpOnly on the API's domain, so the local session state is dropped by
    // the redirect regardless of what the server said.
    await signOut();
    router.replace("/auth/login");
    router.refresh();
  };

  const blocked =
    !isPending && isAuthenticated && !canAccessDashboardPath(pathname, role);

  // Covers "still asking the server", "server said no session", and "this role
  // cannot be here" — the effect above performs the actual redirect, this just
  // holds the UI while it happens.
  if (isPending || !isAuthenticated || blocked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-muted-foreground">
          {isPending
            ? "Loading..."
            : blocked
              ? "Taking you to your dashboard..."
              : "Redirecting to sign in..."}
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        {/* Responsive Sidebar */}
        <DashboardSideBar role={role} name={user?.name ?? null} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
          {/* Top Navbar Header */}
          <header className="flex items-center justify-between border-b border-border px-4 md:px-6 py-3 bg-card sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Dashboard
                </span>
                <span className="text-muted-foreground">/</span>
                <DashboardRoleLabel role={role} />
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </header>

          {/* Main Dashboard Content */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-muted/20">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}