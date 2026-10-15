"use client";

import { useUnreadCount } from "@/hooks/use-unread-count";

/**
 * Unread notification count for the signed-in user.
 *
 * Thin wrapper over the shared `useUnreadCount` store so the sidebar and the
 * seller dashboard share one request and one value. Refreshes when the tab
 * regains focus; errors resolve to 0 rather than surfacing, so a missing badge
 * never breaks the bell.
 */
export function useUnreadNotifications(): number {
  return useUnreadCount();
}
