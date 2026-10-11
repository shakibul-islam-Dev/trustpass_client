/**
 * The API server origin — the one address this app talks to.
 *
 * The browser calls this origin directly (see `apiUrl()` in
 * `lib/core/api-url.ts`), so it must be a `NEXT_PUBLIC_` variable and is
 * inlined at build time. Set it per environment:
 *
 *   local       -> http://localhost:5000            (`.env`)
 *   production  -> https://trust-pass-server.vercel.app  (Vercel dashboard)
 */
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
