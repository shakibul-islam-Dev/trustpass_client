"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "./NavLink";
import { ProfileDropdown } from "./ProfileDropdown";
import { NotificationDropdown } from "@/components/shared/notification-dropdown/NotificationDropdown";
import { Button, buttonVariants } from "@/components/ui/button";
import ToggleBar from "@/components/ToggleBar/ToggleBar";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/core/session";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, role, isAuthenticated } = useAuth();

  // Don't show navbar inside dashboard
  if (path.startsWith("/dashboard")) {
    return null;
  }
  /**
   * Revokes the session on the API, then leaves.
   *
   * The cookie is httpOnly on the API's own domain, so there is nothing to
   * clear locally — the redirect drops this app's view of the session and the
   * server has already invalidated it.
   */
  const handleLogout = async () => {
    // TODO: Uncomment when Better Auth is ready
    // await signOut();
    console.log("Logout clicked");
    await signOut();
    router.replace("/auth/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LEFT: Brand + Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground shadow-sm">
              TP
            </span>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Trust<span className="text-primary">Pass</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <NavLink href="/" exact>
              Home
            </NavLink>
            <NavLink href="/businessesExplore">Explore Businesses</NavLink>
            <NavLink href="/products">Products</NavLink>
            {isAuthenticated && (role === "MODERATOR" || role === "ADMIN") && (
              <NavLink href="/dashboard/moderator/verification-queue">
                Moderator Queue
              </NavLink>
            )}
          </nav>
        </div>

        {/* RIGHT: Theme + Notifications + Profile */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ToggleBar />

          {/* Notification Dropdown (only if logged in) */}
          {isAuthenticated && <NotificationDropdown />}

          {/* Profile Dropdown. Renders a "Sign In" button when signed out. */}
          <ProfileDropdown
            user={
              user
                ? {
                    name: user.name ?? "Signed in",
                    email: user.email,
                    role: user.role ?? undefined,
                    // The API stores the avatar as `image`, not `avatar`.
                    avatar: user.image ?? undefined,
                  }
                : undefined
            }
            onLogout={handleLogout}
          />

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col gap-1 p-4">
            <NavLink href="/" exact>
              Home
            </NavLink>
            <NavLink href="/businessesExplore">Explore Businesses</NavLink>
            <NavLink href="/businesses?verified=true">Verified Only</NavLink>
            {isAuthenticated && (role === "MODERATOR" || role === "ADMIN") && (
              <NavLink href="/dashboard/moderator/verification-queue">
                Moderator Queue
              </NavLink>
            )}

            {/* Signed out, the small screens get the same two links the
                desktop header shows, otherwise Sign Up is unreachable on a
                phone.

                Styled with `buttonVariants` rather than wrapped in
                `<Button render={<Link/>}>`, which would ask Base UI's Button
                to render an <a> and trip its native-button warning. */}
            {!isAuthenticated && (
              <div className="mt-2 flex items-center gap-3 border-t border-border pt-3">
                <Link
                  href="/auth/login"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "flex-1",
                  )}
                >
                  Sign In
                </Link>

                <Link
                  href="/auth/register"
                  className={cn(buttonVariants({ size: "sm" }), "flex-1")}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
