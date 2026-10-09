// Previous implementation by: Existing Developer
// Updated implementation for: Customer Notifications actions
// Client-side fetch — cookie automatic goes via credentials: "include".
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";

export const markNotificationAsRead = async (notificationId: string) => {
  console.log("🟡 markNotificationAsRead:", notificationId);
  try {
    const res = await fetch(
      apiUrl(`/api/v1/notifications/${notificationId}/read`),
      {
        method: "PATCH",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { error: true, status: res.status, message: errorData.message };
    }
    return await res.json();
  } catch (error) {
    return { error: true, message: error instanceof Error ? error.message : "Unknown" };
  }
};

export const markAllNotificationsAsRead = async () => {
  console.log("🟡 markAllNotificationsAsRead");
  try {
    const res = await fetch(apiUrl("/api/v1/notifications/read-all"), {
      method: "PATCH",
      credentials: "include",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { error: true, status: res.status, message: errorData.message };
    }
    return await res.json();
  } catch (error) {
    return { error: true, message: error instanceof Error ? error.message : "Unknown" };
  }
};

export const deleteNotification = async (notificationId: string) => {
  console.log("🔴 deleteNotification:", notificationId);
  try {
    const res = await fetch(
      apiUrl(`/api/v1/notifications/${notificationId}`),
      {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { error: true, status: res.status, message: errorData.message };
    }
    return await res.json();
  } catch (error) {
    return { error: true, message: error instanceof Error ? error.message : "Unknown" };
  }
};