/**
 * Notification count API, called from the browser.
 *
 * The seller dashboard shows the signed-in user's unread notification count.
 * This helper reads the field the server actually returns,
 * `data.unreadCount` (see `notification.controller.ts` / `getUnreadCount`).
 *
 * Endpoint used:
 *   GET /api/v1/notifications/unread-count
 *     -> { success, statusCode, message, data: { unreadCount: number } }
 *
 * The count is best-effort: any error resolves to 0 rather than surfacing, so a
 * missing badge never breaks the dashboard.
 */

import { apiUrl } from "@/lib/core/api-url";
import { apiFetch } from "@/lib/core/api-fetch";

/** The signed-in user's unread notification count (0 when it cannot be loaded). */
export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const response = await apiFetch(apiUrl("/api/v1/notifications/unread-count"), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) return 0;

    const envelope = (await response.json()) as { data?: { unreadCount?: number } };
    return envelope?.data?.unreadCount ?? 0;
  } catch (error) {
    console.error("Could not load the unread notification count:", error);
    return 0;
  }
}
