import { NextResponse } from "next/server";

/**
 * Next.js 16 renamed `middleware` -> `proxy` (see
 * node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md).
 *
 * There is deliberately NO session gate here, and this file is a no-op on
 * purpose. Keep it that way unless you have a reason to change it.
 *
 * The session cookie is issued by the API server
 * (NEXT_PUBLIC_BASE_URL) for *its own* domain, so it is never present on this
 * app's origin. `cookies()` in proxy would therefore be empty for every
 * signed-in user, and any check built on it would be false 100% of the time —
 * locking everyone out of /dashboard, or worse, appearing to work while doing
 * nothing. The cookie is also httpOnly, so it cannot be read in the browser
 * either.
 *
 * Session enforcement therefore lives in three places instead:
 *   1. `useAuth()` + `lib/core/roles.ts` in app/dashboard/layout.tsx. Reads the
 *      session from the API and redirects by role. UX, not a boundary.
 *   2. The API's own `auth()` middleware rejects unauthorised requests. This is
 *      the real boundary.
 *   3. Login/register/OTP only ever talk to the API, so no request carries a
 *      token this app could fabricate or leak.
 */
export default function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};