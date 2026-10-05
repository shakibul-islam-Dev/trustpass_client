import { NextResponse } from "next/server";

/**
 * Next.js 16 renamed `middleware` -> `proxy` (see
 * node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md).
 *
 * There is deliberately NO session gate here.
 *
 * The session cookie is issued by the API server
 * (NEXT_PUBLIC_BASE_URL) for *its own* domain, so it is never present on this
 * app's origin. Any cookie check in the proxy would therefore be false for
 * every signed-in user and bounce them to /auth/login forever.
 *
 * Session enforcement lives in two places instead:
 *   1. Client-side: `useAuth()` in app/dashboard/layout.tsx redirects when
 *      there is no session. This is UX only, not a security boundary.
 *   2. Server-side: the API's own `auth()` middleware rejects unauthorised
 *      requests. That is the real boundary.
 */
export default function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};