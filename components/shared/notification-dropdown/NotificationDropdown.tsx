"use client";

import { Bell, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification } from "@/types/customer";

interface NotificationDropdownProps {
  /**
   * Optional: Where to navigate when "See More" is clicked.
   * Default: "/dashboard/customer/notifications"
   */
  seeMoreLink?: string;
}

export const NotificationDropdown = ({
  seeMoreLink = "/dashboard/customer/notifications",
}: NotificationDropdownProps) => {
  const router = useRouter();
  const {
    latestNotifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  /**
   * Handles clicking on a notification item.
   * Marks as read, then navigates to the link (if any).
   */
  const handleItemClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  /**
   * Navigates to the full notifications page.
   */
  const handleSeeMore = () => {
    router.push(seeMoreLink);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {/* Unread badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-semibold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      } />

      <DropdownMenuContent align="end" className="w-[380px] p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-muted-foreground">
                ({unreadCount} unread)
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Mark all
            </Button>
          )}
        </div>

        <Separator />

        {/* Notification List */}
        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : latestNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="divide-y divide-border">
              {latestNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onItemClick={handleItemClick}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        <Separator />

        {/* Footer: See More */}
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full text-sm"
            onClick={handleSeeMore}
          >
            See All Notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};