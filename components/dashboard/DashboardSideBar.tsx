"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { roleSidebars } from "@/lib/sidebarData";
import { roleLabel, type ApiRole } from "@/lib/core/roles";
import { signOut } from "@/lib/core/session";
import { useUnreadNotifications } from "@/hooks/use-unread-notifications";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Shield, LogOut, Home } from "lucide-react";
import { toast } from "sonner";
import ToggleBar from "../ToggleBar/ToggleBar";


interface SidebarProps {
  /** From the session, never inferred from the URL. */
  role: ApiRole;
  name: string | null;
}

export default function DashboardSideBar({ role, name }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile, isMobile } = useSidebar();
  const unreadNotifications = useUnreadNotifications();

  // `roleSidebars` covers every ApiRole, so this is a total lookup. The fallback
  // is defensive only — an unknown role was already narrowed to CUSTOMER by
  // `useAuth` before reaching here.
  const currentSidebar = roleSidebars[role] ?? roleSidebars.CUSTOMER;
  const label = roleLabel(role);

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogout = async () => {
    const ok = await signOut();
    if (!ok) {
      toast.error("Could not sign you out. Please try again.");
      return;
    }
    toast.success("Signed out.");
    router.replace("/auth/login");
    router.refresh();
  };

  const initials = (name ?? "").trim().split(/\s+/).filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/60 bg-card text-card-foreground"
    >
      {/* 1. Header - Brand. Collapses to just the shield icon. */}
      <SidebarHeader className="border-b border-border/40 p-4 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-surface shrink-0">
            <Shield className="h-5 w-5 fill-current" />
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-base tracking-tight text-foreground flex items-center gap-2">
              <Link href="/">TrustPass</Link>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase bg-primary-soft text-primary rounded-md">
                {label}
              </span>
            </span>
            <span className="text-xs text-muted-foreground">
              Digital Trust Platform
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* 2. Content - Navigation. Becomes an icon rail when collapsed. */}
      <SidebarContent className="p-2">
        <SidebarGroup>
          {currentSidebar.title && (
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider px-3 mb-1">
              {currentSidebar.title}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {currentSidebar.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                const isNotifications = item.href.endsWith("/notifications");

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.name}
                      onClick={handleLinkClick}
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-(--duration-base) ease-(--ease) ${
                        isActive
                          ? "bg-primary-soft text-primary font-semibold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                        <span className="flex-1 text-left group-data-[collapsible=icon]:hidden">
                          {item.name}
                        </span>

                        {isNotifications && unreadNotifications > 0 && (
                          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground group-data-[collapsible=icon]:hidden">
                            {unreadNotifications > 99 ? "99+" : unreadNotifications}
                          </span>
                        )}

                        {isActive && (
                          <div className="ml-auto w-1.5 h-4 bg-primary rounded-full group-data-[collapsible=icon]:hidden" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 3. Footer - Home + Theme, then User + Logout. Stacks into icons when
          collapsed so nothing is clipped or overflows the rail. */}
      <SidebarFooter className="gap-2 border-t border-border/40 p-3 group-data-[collapsible=icon]:p-2">

        {/* 3a. Quick Actions Row (Home + Theme Toggle) */}
        <div className="flex items-center justify-between gap-1 rounded-xl bg-muted/40 p-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1 group-data-[collapsible=icon]:p-1">
          {/* Home Button */}
          <Link
            href="/"
            onClick={handleLinkClick}
            className="flex flex-1 items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            title="Go to Homepage"
          >
            <Home className="h-4 w-4 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">Home</span>
          </Link>

          {/* Divider */}
          <div className="w-px h-5 bg-border/60 mx-1 group-data-[collapsible=icon]:hidden" />

          {/* Theme Toggle */}
          <div className="flex items-center justify-center px-2 group-data-[collapsible=icon]:px-0">
            <ToggleBar />
          </div>
        </div>

        {/* 3b. User Info Row */}
        <div className="flex items-center justify-between gap-2 rounded-xl bg-muted/50 p-2.5 transition-colors hover:bg-muted group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1.5 group-data-[collapsible=icon]:p-1.5">
          <div className="flex items-center gap-2.5 min-w-0 group-data-[collapsible=icon]:justify-center">
            <div className="h-8 w-8 rounded-full bg-linear-to-tr from-primary to-primary-deep text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="text-xs font-semibold text-foreground truncate">
                {name ?? "Signed in"}
              </span>
              <span className="text-xs text-muted-foreground truncate capitalize">
                {label} Account
              </span>
            </div>
          </div>
          <button
            type="button"
            title="Log out"
            aria-label="Log out"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg transition-colors group-data-[collapsible=icon]:mx-auto"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
