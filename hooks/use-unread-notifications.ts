"use client";

import { useEffect, useState } from "react";

import { fetchUnreadCount } from "@/lib/customer_api/notifications";

/**
 * Unread notification count for the signed-in user.
 *
 * Refreshes when the tab regains focus so the badge stays in sync after the
 * notifications page marks items as read. Errors resolve to 0 rather than
 * surfacing — a missing badge is better than a broken bell.
 */
export function useUnreadNotifications(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const value = await fetchUnreadCount();
      if (active) setCount(value);
    };

    void load();
    window.addEventListener("focus", load);
    return () => {
      active = false;
      window.removeEventListener("focus", load);
    };
  }, []);

  return count;
}
