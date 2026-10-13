/**
 * Turns an API path into a full URL for the API server of the current
 * environment:
 *
 *   apiUrl("/api/v1/auth/login")
 *   -> "http://localhost:5000/api/v1/auth/login"   (`next dev`)
 *   -> "https://trust-pass-server.vercel.app/api/v1/auth/login" (production)
 *
 * The origin itself is defined in exactly one place — `lib/core/env.ts`.
 * Nothing else in the app should assemble the API origin by hand; import this
 * helper (or `SERVER_URL` from `lib/core/env.ts`) instead.
 */

import { SERVER_URL } from "@/lib/core/env";

export function apiUrl(path: string): string {
  // Browser requests go through this Next.js app's origin. The rewrite in
  // next.config.ts forwards them to the API, avoiding browser CORS and
  // cross-site session-cookie behavior. Server-side callers still need an
  // absolute URL because they do not pass through the browser rewrite.
  if (typeof window !== "undefined") {
    return path;
  }

  return `${SERVER_URL}${path}`;
}
