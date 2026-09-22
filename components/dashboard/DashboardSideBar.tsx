"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { roleSidebars, UserRole } from "@/lib/sidebarData";
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
import { Shield, LogOut } from "lucide-react";

interface SidebarProps {
  userRole: UserRole;
}

export default function DashboardSideBar({ userRole }: SidebarProps) {
  const pathname = usePathname();
<<<<<<< HEAD
  const { setOpenMobile, isMobile } = useSidebar();
=======
>>>>>>> ab474f7 (Save local changes)

  const currentSidebar = roleSidebars[userRole] || roleSidebars.user;

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar className="border-r border-border/60 bg-card text-card-foreground">
      {/* 1. Header */}
      <SidebarHeader className="p-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-500/20 shrink-0">
            <Shield className="h-5 w-5 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-foreground flex items-center gap-2">
              TrustPass
              <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 rounded-md">
                {userRole}
              </span>
            </span>
            <span className="text-[11px] text-muted-foreground">Digital Trust Platform</span>
          </div>
        </div>
      </SidebarHeader>

      {/* 2. Content */}
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

                return (
                  <SidebarMenuItem key={item.href}>
                    {/* asChild soriye dewa hoyeche jate Radix button element DOM error na dey */}
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={handleLinkClick}
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 font-semibold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Link href={item.href} className="flex items-center gap-3 w-full">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            isActive ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground"
                          }`}
                        />
                        <span className="flex-1 text-left">{item.name}</span>

                        {isActive && (
                          <div className="ml-auto w-1.5 h-4 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
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

          {/* log out button  */}
          {/* github check  */}
            {/* git check ddddddd */}
            {/* dkfhakdjjdkfjdkdkj djfkdjfkdajf */}
      {/* 3. Footer */}
      <SidebarFooter className="p-3 border-t border-border/40">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              A
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-foreground truncate">Aritro M.</span>
              <span className="text-[10px] text-muted-foreground truncate capitalize">{userRole} Account</span>
            </div>
          </div>
          <button
            title="Logout"
            className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}