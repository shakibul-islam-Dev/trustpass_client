/**
 * The API addresses this app uses — two of them, named clearly.
 *
 *   LOCAL_API_URL — the address intended for local development.
 *   LIVE_API_URL  — the address for production.
 *
 * BOTH currently point at the LIVE API (https://trust-pass-server.vercel.app)
 * on purpose: this app must only ever talk to the Live API and never to a
 * local server. The "local" slot exists so that if a real local server is
 * ever allowed, only `LOCAL_API_URL` has to change — nothing else in the app
 * knows the address.
 */

/** Intended for local development. Kept at the Live URL — no local server. */
export const LOCAL_API_URL = "https://trust-pass-server.vercel.app";

/** Intended for production. The Live API. */
export const LIVE_API_URL = "https://trust-pass-server.vercel.app";

/**
 * The address every API request is actually sent to. Always the Live URL.
 */
const API_BASE_URL = LIVE_API_URL;

/**
 * Turns an API path into the full URL.
 *
 *   apiUrl("/api/auth/sign-in/email")
 *   -> "https://trust-pass-server.vercel.app/api/auth/sign-in/email"
 */
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}