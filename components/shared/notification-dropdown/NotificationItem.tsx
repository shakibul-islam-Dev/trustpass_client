import { Bell, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Notification } from "@/types/customer";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onItemClick: (notification: Notification) => void;
}

export const NotificationItem = ({
  notification,
  onMarkAsRead,
  onItemClick,
}: NotificationItemProps) => {
  // Icon color based on type
  const getIconColor = () => {
    switch (notification.type) {
      case "REPORT_UPDATE":
        return "text-blue-500 bg-blue-500/10";
      case "TRUST_SCORE":
        return "text-green-500 bg-green-500/10";
      case "SYSTEM":
        return "text-muted-foreground bg-muted";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div
      className={`flex items-start gap-3 p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
        !notification.isRead ? "bg-primary/5" : ""
      }`}
      onClick={() => onItemClick(notification)}
    >
      {/* Icon */}
      <div className={`p-2 rounded-full shrink-0 ${getIconColor()}`}>
        <Bell className="h-3.5 w-3.5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm ${!notification.isRead ? "font-semibold" : "font-medium"} line-clamp-1`}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
          )}
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>

        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{notification.createdAt}</span>
          </div>

          {/* Mark as read button (only if unread) */}
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark read
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};