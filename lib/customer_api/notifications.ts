// Previous implementation by: Existing Developer
// Kept for reference because Server Action cannot send cross-origin cookies.
// Updated implementation for: Customer Notifications page
// Client-side fetch + response normalization.
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";

export type TNotificationType =
  | "REPORT_UPDATE"
  | "TRUST_SCORE"
  | "SYSTEM"
  | "PAYMENT";

export interface INotificationResponse {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: TNotificationType;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

const normalizeNotification = (raw: any): INotificationResponse => ({
  id: raw.id,
  userId: raw.userId ?? raw.user_id,
  title: raw.title || "Notification",
  message: raw.message || raw.body || "",
  type: (raw.type || "SYSTEM") as TNotificationType,
  isRead: raw.isRead ?? raw.is_read ?? false,
  link: raw.link,
  createdAt: raw.createdAt ?? raw.created_at,
});

export const fetchMyNotifications = async (
  query = ""
): Promise<INotificationResponse[]> => {
  const url = apiUrl(`/api/v1/notifications${query}`);
  console.log("🔍 fetchMyNotifications URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    console.log("📥 fetchMyNotifications status:", response.status);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("❌ fetchMyNotifications error:", response.status, errorText);
      return [];
    }

    const json = await response.json();
    console.log("📥 fetchMyNotifications raw:", json);

    let rawArray: any[] = [];
    if (Array.isArray(json)) rawArray = json;
    else if (Array.isArray(json?.data)) rawArray = json.data;
    else if (Array.isArray(json?.notifications)) rawArray = json.notifications;
    else if (Array.isArray(json?.data?.notifications)) rawArray = json.data.notifications;

    return rawArray.map(normalizeNotification);
  } catch (error) {
    console.error("❌ fetchMyNotifications exception:", error);
    return [];
  }
};

export const fetchUnreadCount = async (): Promise<number> => {
  try {
    const response = await fetch(
      apiUrl("/api/v1/notifications/unread-count"),
      { method: "GET", credentials: "include", cache: "no-store" }
    );

    if (!response.ok) return 0;

    const json = await response.json();
    return json?.count ?? json?.data?.count ?? 0;
  } catch {
    return 0;
  }
};