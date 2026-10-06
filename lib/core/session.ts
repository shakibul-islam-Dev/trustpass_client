/**
 * Session handling, entirely against the API server.
 *
 * There is no better-auth client in this app. Every call below is plain `fetch`
 * to `NEXT_PUBLIC_BASE_URL`, and the session lives in the server's own
 * httpOnly cookie — this app never sees or stores the token itself.
 *
 * Why a plain fetch works for the session cookie: the cookie is issued by the
 * API server for the API server's domain, so it is only ever present on
 * requests to that origin. `credentials: "include"` is what carries it, which
 * is why it must be set on EVERY call below, including `getSession`.
 *
 * Two endpoints matter:
 *   GET  /api/auth/get-session  -> { session, user } | null
 *   POST /api/v1/auth/logout    -> revokes the session server-side
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export function isApiConfigured(): boolean {
  return Boolean(API_BASE_URL);
}

export function requireApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not set.");
  }
  return API_BASE_URL;
}

/** Roles as stored by the API (prisma `user.role`). */
export type ApiRole = "CUSTOMER" | "SELLER" | "MODERATOR" | "ADMIN";

export type SessionUser = {
  id: string;
  name?: string | null;
  email: string;
  emailVerified?: boolean;
  image?: string | null;
  role?: ApiRole;
  status?: string;
  gender?: string | null;
  phone?: string | null;
};

export type Session = {
  session: { id: string; token?: string; expiresAt?: string } | null;
  user: SessionUser | null;
};

export const ANONYMOUS_SESSION: Session = { session: null, user: null };

/**
 * Reads the current session from the server.
 *
 * Never throws: an unreachable server, a network error or a non-JSON body all
 * resolve to the anonymous session. A failed read must not be able to throw a
 * user out of the UI or crash a render, and callers cannot tell "logged out"
 * from "server unreachable" — both correctly mean "show no user".
 */
export async function getSession(): Promise<Session> {
  let response: Response;

  try {
    response = await fetch(`${requireApiBaseUrl()}/api/auth/get-session`, {
      method: "GET",
      // Required. The cookie belongs to the API's domain, so it only travels
      // cross-origin when credentials are included.
      credentials: "include",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    return ANONYMOUS_SESSION;
  }

  if (!response.ok) return ANONYMOUS_SESSION;

  try {
    const body = (await response.json()) as Partial<Session> | null;
    // The server answers `null` (a literal JSON null, 200) when there is no
    // valid session. Anything without a user is treated as signed out.
    if (!body || !body.user) return ANONYMOUS_SESSION;
    return { session: body.session ?? null, user: body.user };
  } catch {
    return ANONYMOUS_SESSION;
  }
}

/**
 * Revokes the session server-side.
 *
 * Resolves `true` when the server confirmed the sign-out. A failure resolves
 * `false` rather than throwing, so callers can still send the user to the login
 * page — the local cookie may well be gone even if the round-trip failed.
 */
export async function signOut(): Promise<boolean> {
  try {
    const response = await fetch(`${requireApiBaseUrl()}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });

    return response.ok;
  } catch {
    return false;
  }
}

export type SocialProvider = "google" | "facebook";

/**
 * Starts an OAuth sign-in and returns the provider URL to navigate to.
 *
 * The server owns the OAuth handshake and hands back the Google/Facebook
 * authorize URL, so the client just has to follow it. Any failure returns
 * `null` for the caller to report.
 */
export async function getSocialAuthUrl(
  provider: SocialProvider,
  callbackURL = "/",
): Promise<string | null> {
  try {
    const response = await fetch(
      `${requireApiBaseUrl()}/api/auth/sign-in/social`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, callbackURL }),
      },
    );

    if (!response.ok) return null;

    const body = (await response.json()) as { url?: unknown; error?: unknown };

    return typeof body.url === "string" ? body.url : null;
  } catch {
    return null;
  }
}

/**
 * Sends the browser to the provider.
 *
 * `window.location.assign` (not a router push) because the destination is an
 * external origin, and the provider returns to the server's callback route
 * rather than to this app.
 */
export async function signInWithSocial(
  provider: SocialProvider,
  callbackURL = "/",
): Promise<boolean> {
  const url = await getSocialAuthUrl(provider, callbackURL);

  if (!url) return false;

  window.location.assign(url);
  return true;
}
