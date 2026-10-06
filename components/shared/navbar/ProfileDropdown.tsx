"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, LayoutDashboard, LogOut, Settings, ChevronDown } from "lucide-react";
import { homeForRole, isApiRole } from "@/lib/core/roles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProfileDropdownProps {
  user?: {
    name: string;
    email: string;
    role?: string;
    avatar?: string;
  };
  onLogout: () => void;
}

export const ProfileDropdown = ({ user, onLogout }: ProfileDropdownProps) => {
  const router = useRouter();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Single source of truth for role -> landing page. The old switch in this file
  // listed a BUYER role and sent it to `/dashboard/buyer/overview`, which does
  // not exist, and sent every CUSTOMER to `/dashboard/customer/reports` rather
  // than their own dashboard.
  const getDashboardPath = (role?: string) => {
    if (!role) return homeForRole(undefined);
    return homeForRole(isApiRole(role) ? role : undefined);
  };

  // Signed out: show both links.
  //
  // There used to be only a "Sign In" button here, which left the register page
  // (/auth/register) with no link pointing at it anywhere in the navbar — the
  // only way to reach it was to type the URL. Visitors who came to sign up had
  // to guess the address.
  //
  // These are styled with `buttonVariants` instead of being wrapped in
  // `<Button render={<Link/>}>`. That render trick asks Base UI's Button to
  // output an <a>, but Base UI assumes it is rendering a real <button> and
  // warns about the lost button semantics. `buttonVariants` only returns a
  // className, so the Link stays a real link with correct keyboard, middle
  // click and "open in new tab" behaviour.
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/auth/login"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Sign In
        </Link>

        <Link
          href="/auth/register"
          className={buttonVariants({ size: "sm" })}
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      } />

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              {user.role && (
                <span className="text-xs text-primary font-medium mt-1">
                  {user.role}
                </span>
              )}
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem 
            onClick={() => router.push(getDashboardPath(user.role))}
            className="cursor-pointer"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => router.push("/profile")}
            className="cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" />
            My Profile
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => router.push("/settings")}
            className="cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={onLogout}
          className="cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};