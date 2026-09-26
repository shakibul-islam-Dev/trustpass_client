"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "./NavLink";
import { ProfileDropdown } from "./ProfileDropdown";
import { NotificationDropdown } from "@/components/shared/notification-dropdown/NotificationDropdown";
import { Button } from "@/components/ui/button";
import ToggleBar from "@/components/ToggleBar/ToggleBar";

// Dummy user - replace with Better Auth session later
const DUMMY_USER = {
  name: "TrustPass",
  email: "trustpass@example.com",
  role: "ADMIN", // Change to "CUSTOMER", "BUYER", "MODERATOR" to test
  avatar: "",
};

export default function Navbar() {
  const path = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Don't show navbar inside dashboard
  if (path.startsWith("/dashboard")) {
    return null;
  }

  /**
   * Handles user logout.
   * TODO: Replace with Better Auth signOut() call
   */
  const handleLogout = async () => {
    // TODO: Uncomment when Better Auth is ready
    // await signOut();
    console.log("Logout clicked");
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
            <NavLink href="/" exact>Home</NavLink>
            <NavLink href="/businessesExplore">Explore Businesses</NavLink>
              <NavLink href="/products">Products</NavLink>
            <NavLink href="/moderator/verifications">Moderator Queue</NavLink>
          </nav>
        </div>

        {/* RIGHT: Theme + Notifications + Profile */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ToggleBar />

          {/* Notification Dropdown (only if logged in) */}
          {DUMMY_USER && <NotificationDropdown />}

          {/* Profile Dropdown */}
          <ProfileDropdown 
            user={DUMMY_USER} 
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
            <NavLink href="/" exact>Home</NavLink>
            <NavLink href="/businessesExplore">Explore Businesses</NavLink>
            <NavLink href="/businesses?verified=true">Verified Only</NavLink>
            <NavLink href="/moderator/verifications">Moderator Queue</NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}