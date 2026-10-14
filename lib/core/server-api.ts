/**
 * Server-side API helper.
 *
 * The browser calls the API through the `/api/*` rewrite in `next.config.ts`,
 * so the session cookie is first-party and travels automatically. Server
 * Components do not pass through that rewrite, so they must (a) use the
 * absolute API origin and (b) forward the incoming request's cookies
 * themselves.
 *
 * Importing `next/headers` here makes this module server-only: any accidental
 * import from a Client Component fails the build rather than shipping a broken
 * fetch. Server Components use this to load data before the browser renders,
 * removing the client-side "mount, then fetch" round-trip.
 *
 * Like the browser helpers, every call returns `{ ok, message, data }` and
 * never throws — a failed read is data the caller can render around.
 */

import { cookies } from "next/headers";

import { SERVER_URL } from "@/lib/core/env";

interface ApiEnvelope<T> {
  success: boolean;
  statusCode?: number;
  message?: string;
  data?: T;
}

export interface ServerApiResult<T> {
  ok: boolean;
  message: string;
  data: T | null;
  status: number;
}

/** Forward the incoming request's cookies to the API, or `undefined` if none. */
async function forwardCookies(): Promise<string | undefined> {
  const store = await cookies();
  const all = store.getAll();
  if (all.length === 0) return undefined;
  return all.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
}

/**
 * GET `path` from the API server as the current request's user.
 *
 * `cache: "no-store"` keeps every dashboard read per-request (these are
 * user-specific and must never be cached across users).
 */
export async function serverApiGet<T>(path: string): Promise<ServerApiResult<T>> {
  const headers: Record<string, string> = { Accept: "application/json" };

  const cookieHeader = await forwardCookies();
  if (cookieHeader) headers.cookie = cookieHeader;

  let response: Response;
  try {
    response = await fetch(`${SERVER_URL}${path}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });
  } catch (error) {
    console.error("Server API request failed:", error);
    return {
      ok: false,
      message: "Could not reach the server. Please try again.",
      data: null,
      status: 0,
    };
  }

  let envelope: ApiEnvelope<T> | null = null;
  try {
    envelope = (await response.json()) as ApiEnvelope<T>;
  } catch {
    envelope = null;
  }

  if (!envelope || !envelope.success) {
    return {
      ok: false,
      message: envelope?.message || `Request failed (${response.status}).`,
      data: null,
      status: response.status,
    };
  }

  return {
    ok: true,
    message: envelope.message || "Done.",
    data: envelope.data ?? null,
    status: response.status,
  };
}
