/**
 * The API server origin — resolved per environment so the app works locally and
 * in production with no per-deploy configuration.
 *
 *   1. `NEXT_PUBLIC_SERVER_URL`, when set (override / staging escape hatch).
 *   2. Otherwise the local API in `next dev`.
 *   3. Otherwise the live API in a production build.
 *
 * The browser calls this origin directly (see `apiUrl()` in
 * `lib/core/api-url.ts`), so it must be a `NEXT_PUBLIC_` variable and is
 * inlined at build time.
 */
const LIVE_SERVER_URL = "https://trust-pass-server.vercel.app";
const LOCAL_SERVER_URL = "http://localhost:5000";

const isProduction = process.env.NODE_ENV === "production";

export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (isProduction ? LIVE_SERVER_URL : LOCAL_SERVER_URL);
