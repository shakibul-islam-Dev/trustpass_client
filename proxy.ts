import { NextResponse } from "next/server";

/**
 * Next.js 16 renamed `middleware` -> `proxy` (see
 * node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md).
 *
 * There is deliberately NO session gate here, and this file is a no-op on
 * purpose. Keep it that way unless you have a reason to change it.
 *
 * Sessions are authenticated by the API's own middleware on every protected
 * endpoint, not by this app, so a gate here would add a second, weaker copy of
 * the check for no benefit. Two things worth knowing:
 *
 * - The proxy-free path: the cookie is httpOnly, so it can never be read by
 *   scripts on this app; the session is only ever verified by round-tripping
 *   it to the API (e.g. `useAuth()` -> `getSession()`).
 * - Since the `/api/*` rewrite in `next.config.ts` (see lib/core/api-url.ts),
 *   the session cookie IS issued for this app's own origin, so it would be
 *   visible to `cookies()` here — but it is still a UX/redirect concern at
 *   best, and the API remains the actual boundary.
 *
 * Session enforcement therefore lives in two places instead:
 *   1. `useAuth()` + `lib/core/roles.ts` in app/dashboard/layout.tsx. Reads the
 *      session from the API and redirects by role. UX, not a boundary.
 *   2. The API's own `auth()` middleware rejects unauthorised requests. This is
 *      the real boundary.
 */
export default function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};