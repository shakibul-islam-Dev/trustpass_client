/**
 * Turns an API path into a full URL for the API server of the current
 * environment:
 *
 *   apiUrl("/api/auth/sign-in/email")
 *   -> "http://localhost:5000/api/auth/sign-in/email"   (`next dev`)
 *   -> "https://trust-pass-server.vercel.app/api/auth/sign-in/email" (production)
 *
 * The origin itself is defined in exactly one place — `lib/core/env.ts`.
 * Nothing else in the app should assemble the API origin by hand; import this
 * helper (or `SERVER_URL` from `lib/core/env.ts`) instead.
 */

import { SERVER_URL } from "@/lib/core/env";

export function apiUrl(path: string): string {
  return `${SERVER_URL}${path}`;
}
