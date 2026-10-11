// Emergency implementation by: Aritro
// Reason: Admin/Moderator notification send/broadcast UI was unassigned.
// Backend endpoints (from notification.routes.ts):
//   POST /api/v1/notifications/admin/send
//   POST /api/v1/notifications/admin/broadcast
// Requires role ADMIN or MODERATOR.

import { apiUrl } from "@/lib/core/api-url";

export type NotificationType =
  | "SYSTEM"
  | "ACCOUNT"
  | "BUSINESS"
  | "VERIFICATION"
  | "REPORT"
  | "TRUST_SCORE"
  | "PRODUCT"
  | "PROMOTION";

export interface ICreateNotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface IBroadcastNotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  /** Target specific user IDs; if omitted, sends to ALL users */
  userIds?: string[];
}

// ============================================================
// POST /api/v1/notifications/admin/send
// ============================================================

export const sendTargetedNotification = async (
  payload: ICreateNotificationPayload
) => {
  console.log("🟢 sendTargetedNotification:", payload);

  try {
    const res = await fetch(apiUrl("/api/v1/notifications/admin/send"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
      cache: "no-store",
    });

    console.log("📥 sendTargetedNotification status:", res.status);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("❌ sendTargetedNotification failed:", res.status, errorData);
      return {
        error: true,
        status: res.status,
        message:
          errorData.message ||
          errorData.errorSources?.[0]?.message ||
          "Failed to send notification",
      };
    }

    const data = await res.json();
    console.log("✅ sendTargetedNotification success:", data);
    return data;
  } catch (error) {
    console.error("❌ sendTargetedNotification exception:", error);
    return {
      error: true,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// ============================================================
// POST /api/v1/notifications/admin/broadcast
// ============================================================

export const broadcastNotification = async (
  payload: IBroadcastNotificationPayload
) => {
  console.log("🟢 broadcastNotification:", payload);

  try {
    const res = await fetch(
      apiUrl("/api/v1/notifications/admin/broadcast"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
        cache: "no-store",
      }
    );

    console.log("📥 broadcastNotification status:", res.status);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("❌ broadcastNotification failed:", res.status, errorData);
      return {
        error: true,
        status: res.status,
        message:
          errorData.message ||
          errorData.errorSources?.[0]?.message ||
          "Failed to broadcast notification",
      };
    }

    const data = await res.json();
    console.log("✅ broadcastNotification success:", data);
    return data;
  } catch (error) {
    console.error("❌ broadcastNotification exception:", error);
    return {
      error: true,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};