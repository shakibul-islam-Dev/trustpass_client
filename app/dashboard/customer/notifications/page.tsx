"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { CustomerNotificationList } from "@/components/customer/notification-management/CustomerNotificationList";
import {
  fetchMyNotifications,
  type INotificationResponse,
} from "@/lib/customer_api/notifications";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/lib/customer_action/notifications";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<INotificationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMyNotifications("?page=1&limit=50");
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      toast.error("Failed to load notifications.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    const result = await markNotificationAsRead(notificationId);
    if (result?.error) {
      toast.error("Failed to mark as read.");
      return;
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllNotificationsAsRead();
    if (result?.error) {
      toast.error("Failed to mark all as read.");
      return;
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success("All marked as read");
  };

  const handleDelete = async (notificationId: string) => {
    const result = await deleteNotification(notificationId);
    if (result?.error) {
      toast.error("Failed to delete notification.");
      return;
    }
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    toast.success("Notification deleted");
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || n.type === typeFilter;
      const matchesRead =
        readFilter === "all" ||
        (readFilter === "unread" && !n.isRead) ||
        (readFilter === "read" && n.isRead);
      return matchesSearch && matchesType && matchesRead;
    });
  }, [notifications, searchTerm, typeFilter, readFilter]);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground mt-1">
          Stay updated with your reports and account activity.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="REPORT_UPDATE">Report Updates</SelectItem>
            <SelectItem value="TRUST_SCORE">Trust Score</SelectItem>
            <SelectItem value="SYSTEM">System</SelectItem>
          </SelectContent>
        </Select>

        <Select value={readFilter} onValueChange={(v) => setReadFilter(v ?? "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Read Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      ) : (
        <CustomerNotificationList
          notifications={filteredNotifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default NotificationsPage;