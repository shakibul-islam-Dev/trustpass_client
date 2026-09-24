"use client";

import { useState, useEffect, useCallback } from "react";
import type { Notification } from "@/types/customer";

// Dummy data for now - will be replaced with API call later
const DUMMY_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    userId: "c1",
    title: "Report Resolved",
    message: "Your report against 'Tech Solutions Ltd.' has been resolved.",
    type: "REPORT_UPDATE",
    isRead: false,
    link: "/dashboard/customer/reports",
    createdAt: "2 hours ago",
  },
  {
    id: "n2",
    userId: "c1",
    title: "Trust Score Updated",
    message: "The trust score for 'Green Grocery' has been updated to 75.",
    type: "TRUST_SCORE",
    isRead: false,
    link: "/dashboard/customer/reports",
    createdAt: "5 hours ago",
  },
  {
    id: "n3",
    userId: "c1",
    title: "Welcome to TrustPass",
    message: "Thank you for joining TrustPass! Start by browsing verified businesses.",
    type: "SYSTEM",
    isRead: true,
    createdAt: "1 day ago",
  },
  {
    id: "n4",
    userId: "c1",
    title: "Report Rejected",
    message: "Your report against 'Rahim Electronics' was rejected.",
    type: "REPORT_UPDATE",
    isRead: true,
    link: "/dashboard/customer/reports",
    createdAt: "3 days ago",
  },
  {
    id: "n5",
    userId: "c1",
    title: "New Business Verified",
    message: "'Fashion Hub' in Fashion category has been verified.",
    type: "SYSTEM",
    isRead: true,
    link: "/dashboard/customer/reports",
    createdAt: "5 days ago",
  },
  {
    id: "n6",
    userId: "c1",
    title: "Account Security Alert",
    message: "Your account password was changed successfully.",
    type: "SYSTEM",
    isRead: true,
    createdAt: "1 week ago",
  },
];

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetches notifications from API.
   * TODO: Replace with actual API call: GET /api/v1/notifications
   */
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Uncomment when API is ready
      // const res = await fetch("/api/v1/notifications");
      // const data = await res.json();
      // setNotifications(data);

      // Temporary: Use dummy data
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate loading
      setNotifications(DUMMY_NOTIFICATIONS);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /**
   * Marks a single notification as read.
   * TODO: Replace with API call: PATCH /api/v1/notifications/:id/read
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );

    try {
      // TODO: Uncomment when API is ready
      // await fetch(`/api/v1/notifications/${notificationId}/read`, {
      //   method: "PATCH",
      // });
      console.log(`API Call: Mark notification ${notificationId} as read`);
    } catch (error) {
      console.error("Failed to mark as read", error);
      // Revert on error if needed
    }
  }, []);

  /**
   * Marks all notifications as read.
   * TODO: Replace with API call: PATCH /api/v1/notifications/read-all
   */
  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      // TODO: Uncomment when API is ready
      // await fetch("/api/v1/notifications/read-all", {
      //   method: "PATCH",
      // });
      console.log("API Call: Mark all notifications as read");
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  }, []);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Get latest 6 notifications (for dropdown)
  const latestNotifications = notifications.slice(0, 6);

  return {
    notifications,
    latestNotifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
};