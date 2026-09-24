"use client";

import { useState, useMemo } from "react";
import type { Notification } from "@/types/customer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { CustomerNotificationList } from "@/components/customer/notification-management/CustomerNotificationList";

// Dummy Data (6 notifications)
const DUMMY_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    userId: "c1",
    title: "Report Resolved",
    message: "Your report against 'Tech Solutions Ltd.' has been reviewed and resolved. A warning has been issued to the business.",
    type: "REPORT_UPDATE",
    isRead: false,
    link: "/dashboard/customer/reports",
    createdAt: "2 hours ago",
  },
  {
    id: "n2",
    userId: "c1",
    title: "Trust Score Updated",
    message: "The trust score for 'Green Grocery' has been updated to 75 after verification.",
    type: "TRUST_SCORE",
    isRead: false,
    link: "/dashboard/customer/reports",
    createdAt: "5 hours ago",
  },
  {
    id: "n3",
    userId: "c1",
    title: "Welcome to TrustPass",
    message: "Thank you for joining TrustPass! Start by browsing verified businesses or submit a report if you face any issue.",
    type: "SYSTEM",
    isRead: true,
    createdAt: "1 day ago",
  },
  {
    id: "n4",
    userId: "c1",
    title: "Report Rejected",
    message: "Your report against 'Rahim Electronics' was rejected due to insufficient evidence. Please provide more documentation.",
    type: "REPORT_UPDATE",
    isRead: true,
    link: "/dashboard/customer/reports",
    createdAt: "3 days ago",
  },
  {
    id: "n5",
    userId: "c1",
    title: "New Business Verified",
    message: "A new business 'Fashion Hub' in the Fashion category has been verified. Check it out!",
    type: "SYSTEM",
    isRead: true,
    link: "/dashboard/customer/reports",
    createdAt: "5 days ago",
  },
  {
    id: "n6",
    userId: "c1",
    title: "Account Security Alert",
    message: "Your account password was changed successfully. If this wasn't you, please contact support immediately.",
    type: "SYSTEM",
    isRead: true,
    createdAt: "1 week ago",
  },
];

const NotificationsPage = () => {
  // --- States ---
  const [notifications, setNotifications] = useState<Notification[]>(DUMMY_NOTIFICATIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");

  // --- Handlers (API calls will go here later) ---

  /**
   * Handles marking a single notification as read.
   * TODO: Replace with API Call (PATCH /notifications/:id/read)
   */
  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
    console.log(`API Call: Mark notification ${notificationId} as read`);
  };

  /**
   * Handles marking all notifications as read.
   * TODO: Replace with API Call (PATCH /notifications/read-all)
   */
  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    console.log(`API Call: Mark all notifications as read`);
  };

  // --- Filtering Logic ---
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesSearch =
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "all" || notification.type === typeFilter;

      const matchesRead =
        readFilter === "all" ||
        (readFilter === "unread" && !notification.isRead) ||
        (readFilter === "read" && notification.isRead);

      return matchesSearch && matchesType && matchesRead;
    });
  }, [notifications, searchTerm, typeFilter, readFilter]);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground mt-1">
          Stay updated with your reports and account activity.
        </p>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Type Filter */}
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value ?? "all")}>
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

        {/* Read Status Filter */}
        <Select value={readFilter} onValueChange={(value) => setReadFilter(value ?? "all")}>
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

      {/* Notification List */}
      <CustomerNotificationList
        notifications={filteredNotifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </div>
  );
};

export default NotificationsPage;