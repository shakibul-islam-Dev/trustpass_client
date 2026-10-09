// Previous implementation by: Existing Developer
// Kept for reference — used DUMMY_NOTIFICATIONS.
// Updated by: Aritro
// Reason: Now uses real API via fetchMyNotifications (client-side fetch).
// Backend returns nested objects; normalizeReport converts to flat UI shape.

"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  fetchMyNotifications,
  type INotificationResponse,
} from "@/lib/customer_api/notifications";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/lib/customer_action/notifications";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<INotificationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetches notifications from the API.
   */
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchMyNotifications("?limit=50");
      setNotifications(data);
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
   * Marks a single notification as read (optimistic).
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );

    const result = await markNotificationAsRead(notificationId);
    if (result?.error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: false } : n))
      );
      toast.error("Failed to mark as read");
    }
  }, []);

  /**
   * Marks all notifications as read (optimistic).
   */
  const markAllAsRead = useCallback(async () => {
    const prevSnapshot = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    const result = await markAllNotificationsAsRead();
    if (result?.error) {
      setNotifications(prevSnapshot);
      toast.error("Failed to mark all as read");
    }
  }, [notifications]);

  /**
   * Deletes a notification (optimistic).
   */
  const deleteNotificationById = useCallback(
    async (notificationId: string) => {
      const prevSnapshot = notifications;
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      const result = await deleteNotification(notificationId);
      if (result?.error) {
        setNotifications(prevSnapshot);
        toast.error("Failed to delete notification");
      } else {
        toast.success("Notification deleted");
      }
    },
    [notifications]
  );

  // Count unread
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Latest 6 for dropdown
  const latestNotifications = notifications.slice(0, 6);

  return {
    notifications,
    latestNotifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification: deleteNotificationById,
    refetch: fetchNotifications,
  };
};