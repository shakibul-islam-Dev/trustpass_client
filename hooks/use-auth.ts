"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ANONYMOUS_SESSION,
  getSession,
  isApiConfigured,
  type Session,
} from "@/lib/core/session";
import { isApiRole, type ApiRole } from "@/lib/core/roles";

export type { ApiRole };

const CONFIG_ERROR = new Error("No API server URL is configured.");

// Read once. SERVER_URL (lib/core/env.ts) is inlined at build time, so it
// cannot change while the app is running — checking per-call would only add a
// branch.
const CONFIGURED = isApiConfigured();

/**
 * Session state read straight from the API server.
 *
 * Replaces better-auth's `useSession()`. The session cookie is httpOnly and
 * owned by the API's domain, so nothing is kept in localStorage here — this
 * hook only mirrors what the server reports.
 */
export function useAuth() {
  // The initial values are derived from the environment rather than patched up
  // inside the effect below. A missing API URL means there is nothing to read,
  // so it is a starting value, not something to correct for after a fetch —
  // which also keeps every state update in the effect asynchronous.
  const [session, setSession] = useState<Session>(ANONYMOUS_SESSION);
  const [isPending, setIsPending] = useState(CONFIGURED);
  const [error, setError] = useState<Error | null>(
    CONFIGURED ? null : CONFIG_ERROR,
  );

  const refresh = useCallback(async () => {
    // No API URL means there is no session to read, and the initial state
    // above already says so — returning without touching state keeps every
    // update in here behind an `await`.
    if (!CONFIGURED) return;

    try {
      const next = await getSession();

      setSession(next);
      setError(null);
    } catch (e) {
      // getSession already swallows transport errors; this only catches a
      // programming error, so surface it rather than hanging on "Loading...".
      setError(e instanceof Error ? e : new Error("Failed to read session."));
    } finally {
      setIsPending(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Re-read when the tab regains focus, so a session that expired in another
  // tab does not leave this one rendering a stale user.
  useEffect(() => {
    const onFocus = () => {
      void refresh();
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  // The API stores the role as a free-form string, so an unrecognised or
  // missing value is possible (a row written before the role column existed, or
  // a typo). Narrow it once here rather than casting, and fall back to the
  // least-privileged role so an unknown value cannot accidentally widen access.
  const role: ApiRole = isApiRole(session.user?.role)
    ? session.user.role
    : "CUSTOMER";

  return {
    user: session.user,
    role,
    session,
    isPending,
    isAuthenticated: Boolean(session.user),
    error,
    refresh,
  };
}
