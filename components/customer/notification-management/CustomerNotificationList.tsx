// Previous implementation by: Existing Developer
// Updated by: Aritro
// Reason: Added delete button + onDelete prop for notification deletion.

import { Bell, Check, CheckCheck, ExternalLink, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Notification } from "@/types/customer";

interface CustomerNotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (notificationId: string) => void;
}

// ── 🆕 Time formatter — user-friendly relative time ──
const formatRelativeTime = (input?: string | Date | null): string => {
  if (!input) return "";

  let date: Date;
  if (input instanceof Date) {
    date = input;
  } else {
    const str = String(input).trim();
    // Date-only string — treat as local midnight
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      date = new Date(`${str}T00:00:00`);
    } else {
      date = new Date(str);
    }
  }

  if (Number.isNaN(date.getTime())) return String(input);

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  // Future (clock skew)
  if (diffSec < 0) return "Just now";

  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  // Calendar day diff
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  const dayDiff = Math.round(
    (todayStart.getTime() - dateStart.getTime()) / (24 * 60 * 60 * 1000)
  );

  // Just now
  if (diffSec < 60) return "Just now";

  // Minutes ago (same day)
  if (diffMin < 60 && dayDiff === 0) {
    return `${diffMin} min ago`;
  }

  // Hours ago (same day)
  if (diffHr < 24 && dayDiff === 0) {
    return `${diffHr} hr${diffHr > 1 ? "s" : ""} ago`;
  }

  // Yesterday
  if (dayDiff === 1) return "Yesterday";

  // Days ago
  if (dayDiff > 1 && dayDiff < 7) {
    return `${dayDiff} days ago`;
  }

  // Weeks ago
  if (dayDiff < 30) {
    const weeks = Math.floor(dayDiff / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }

  // Older — show date
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

export const CustomerNotificationList = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}: CustomerNotificationListProps) => {
  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Get icon based on notification type
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "REPORT_UPDATE":
        return <Bell className="h-4 w-4 text-blue-500" />;
      case "TRUST_SCORE":
        return <Bell className="h-4 w-4 text-green-500" />;
      case "SYSTEM":
        return <Bell className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Get badge variant based on notification type
  const getTypeBadge = (type: Notification["type"]) => {
    switch (type) {
      case "REPORT_UPDATE":
        return <Badge variant="default">Report</Badge>;
      case "TRUST_SCORE":
        return <Badge variant="secondary">Trust Score</Badge>;
      case "SYSTEM":
        return <Badge variant="outline">System</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Row with Unread Count + Mark All Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? (
              <>
                You have{" "}
                <span className="font-semibold text-foreground">
                  {unreadCount}
                </span>{" "}
                unread notification{unreadCount > 1 ? "s" : ""}
              </>
            ) : (
              "All caught up! No unread notifications."
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Notification List */}
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No notifications yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              You will see updates about your reports and account here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-colors ${
                !notification.isRead
                  ? "border-primary/30 bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={`p-2 rounded-full ${
                      !notification.isRead ? "bg-primary/10" : "bg-muted"
                    }`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className={`text-sm ${
                            !notification.isRead
                              ? "font-semibold"
                              : "font-medium"
                          }`}
                        >
                          {notification.title}
                        </p>
                        {getTypeBadge(notification.type)}
                        {!notification.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {/* ✅ User-friendly time */}
                        <span title={String(notification.createdAt)}>
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Link to related page (if any) */}
                        {notification.link && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              window.open(notification.link, "_self")
                            }
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        )}

                        {/* Mark as Read Button (only if unread) */}
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMarkAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Mark Read
                          </Button>
                        )}

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(notification.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Delete notification"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};