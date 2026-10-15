"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import { getUnreadNotificationCount } from "@/lib/core/notification-api";

/**
 * Shared unread-notification count.
 *
 * The sidebar and the seller dashboard both need this number. Reading it once
 * into a module-level store and letting every subscriber share the result means
 * two components mounting together still fire a single
 * `/api/v1/notifications/unread-count` request instead of one each.
 *
 * Concurrent callers are collapsed behind `inflight`, and a short freshness
 * window keeps navigation between dashboard pages from refetching the count on
 * every mount. `refreshUnreadCount()` forces a re-read after a mutation.
 */

/** Don't refetch on mount if the value was read less than this long ago. */
const STALE_MS = 15_000;

let count = 0;
let loaded = false;
let lastLoadedAt = 0;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

async function refresh(force: boolean): Promise<void> {
  // Collapse concurrent callers (sidebar + dashboard mounting together).
  if (inflight) return inflight;
  if (!force && loaded && Date.now() - lastLoadedAt < STALE_MS) return;

  inflight = (async () => {
    const value = await getUnreadNotificationCount();
    count = value;
    loaded = true;
    lastLoadedAt = Date.now();
    emit();
  })().finally(() => {
    inflight = null;
  });

  return inflight;
}

/** Force a re-read, e.g. after marking notifications as read. */
export function refreshUnreadCount(): Promise<void> {
  return refresh(true);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): number {
  return count;
}

/** The server has no count yet, so the first client render starts at 0. */
function getServerSnapshot(): number {
  return 0;
}

export function useUnreadCount(): number {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const load = useCallback(() => {
    void refresh(false);
  }, []);

  useEffect(() => {
    load();
    // Keep the badge in sync when the tab regains focus (e.g. after the
    // notifications page marked items read in another tab).
    window.addEventListener("focus", load);
    return () => window.removeEventListener("focus", load);
  }, [load]);

  return value;
}
