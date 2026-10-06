/**
 * Auth calls that must go to the API server.
 *
 * The server runs better-auth and exposes it under two prefixes that share
 * ONE user and session store:
 *
 * - `/api/v1/auth/*` — the REST surface this app uses: register, login,
 *   logout, resend-otp, verify-otp.
 * - `/api/auth/*`   — better-auth's own routes (get-session, sign-in/social).
 *   Only `get-session` and the social buttons need these.
 *
 * Login via `/api/v1/auth/login` and verify via `/api/v1/auth/verify-otp` both
 * forward better-auth's `Set-Cookie` headers, so both issue the
 * `__Secure-better-auth.session_token` cookie — the same cookie
 * better-auth's `get-session` reads. `useAuth()` therefore works after either.
 *
 * Server behaviour this file has to work around:
 *
 * The CORS allowlist is `CLIENT_URL` plus `http://localhost:3000`. Any other
 * origin (127.0.0.1, a LAN IP, a Vercel preview URL) fails the preflight and
 * surfaces as `TypeError: Failed to fetch`. That is server-side; this file
 * cannot fix it.
 *
 * The server runs `requireEmailVerification: true`, so an account cannot sign
 * in until an OTP is verified. That makes verify-otp part of the register
 * flow, not an optional extra.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/** Lets a form show a readable message instead of throwing mid-submit. */
export function isApiConfigured(): boolean {
  return Boolean(API_BASE_URL);
}

/**
 * Every email goes through this before it is sent.
 *
 * The server lowercases internally but rejects untrimmed input outright
 * (`{"email":" a@b.com "}` -> 400 Validation Error), and a trailing space
 * would otherwise survive into the resend/verify calls, which the server
 * treats as an unknown address. Normalising once here keeps the address the
 * user sees identical to the one every later call uses.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * NEXT_PUBLIC_* values are inlined at build time, so this throws at runtime
 * rather than silently issuing requests to "undefined/api/v1/...".
 */
function requireApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not set.");
  }
  return API_BASE_URL;
}

type Json = Record<string, unknown>;

async function postJson(path: string, body: Json): Promise<Response> {
  return fetch(`${requireApiBaseUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // The session cookie belongs to the API's own domain, so it has to travel
    // cross-origin.
    credentials: "include",
    body: JSON.stringify(body),
  });
}

/** The user fields the API returns after a successful login or OTP verify. */
export type AuthedUser = {
  id: string;
  name?: string | null;
  email: string;
  emailVerified?: boolean;
  role?: string;
  status?: string;
};

export type LoginResult =
  | { ok: true; user: AuthedUser | null }
  | {
      ok: false;
      status: number;
      /**
       * 403 from the server, which has two unrelated causes. Unlike the older
       * comment here claimed, they ARE distinguishable: the server sends
       * "Please verify your email before signing in. Check your inbox for the
       * OTP." for an unverified address, and a different sentence for a
       * BLOCKED/SUSPENDED account. Matched on that wording below.
       */
      needsVerification: boolean;
      /** Raw `message` from the body, for the safe-message layer to vet. */
      serverMessage: string | null;
      /**
       * The original response, unread. `readApiError` needs it to reach the
       * per-field detail in `errorSources` — `message` is just
       * "Validation Error" when the form sends an unvalidated body.
       */
      response: Response;
    };

/** Verbatim prefix the server uses for an unverified address at login. */
const UNVERIFIED_LOGIN_MESSAGE =
  "please verify your email before signing in";

/** Signs in with email + password. The server sets the session cookie. */
export async function loginWithPassword(
  email: string,
  password: string,
): Promise<LoginResult> {
  const response = await postJson("/api/v1/auth/login", {
    email: normalizeEmail(email),
    password,
  });
  // `.clone()` so the caller can still read the body via `response`.
  const body = await response.clone().json().catch(() => null);
  const serverMessage =
    typeof body?.message === "string" ? body.message : null;

  // The session cookie is already stored by the browser at this point, because
  // `credentials: "include"` was set on the request. Reading the role out of
  // the body just saves a second /get-session call before redirecting.
  if (response.ok && body?.success) {
    const user = (body?.data as { user?: AuthedUser } | null)?.user ?? null;
    return { ok: true, user };
  }

  return {
    ok: false,
    status: response.status,
    needsVerification:
      response.status === 403 &&
      typeof serverMessage === "string" &&
      serverMessage.toLowerCase().startsWith(UNVERIFIED_LOGIN_MESSAGE),
    serverMessage,
    response,
  };
}

/* ---------------------------------------------------------------------------
 * OTP ENDPOINTS
 * ---------------------------------------------------------------------------
 * Both are live on the server and part of the register flow, because the server
 * enforces `requireEmailVerification: true`. Without them a new account exists
 * but can never sign in.
 * ------------------------------------------------------------------------- */

/** Issues a fresh code. Answers 200 with a deliberately vague message. */
export async function resendOtp(email: string): Promise<Response> {
  return postJson("/api/v1/auth/resend-otp", {
    email: normalizeEmail(email),
  });
}

export type VerifyOtpResult =
  | { ok: true; user: AuthedUser | null }
  | {
      ok: false;
      status: number;
      /** Raw `message` from the body, for the safe-message layer to vet. */
      serverMessage: string | null;
      /**
       * 400 from the server, which means either a wrong/expired code or an
       * address that is already verified. The two are indistinguishable here.
       */
      invalidCode: boolean;
      /** The original response, unread. See `LoginResult.response`. */
      response: Response;
    };

/**
 * Verifies the 6-digit code. On success the address is marked verified and the
 * user is signed in at the same time — the server sets the session cookie and
 * sends the user back in the body.
 *
 * The returned `user` is what tells the caller where to send people next, since
 * the role decides the dashboard. This function does NOT try to read the
 * Set-Cookie header to check whether sign-in happened: browsers block scripts
 * from reading that header, so the check always reported "no session" and
 * kicked a correctly verified user back to the password screen.
 */
export async function verifyOtp(
  email: string,
  otp: string,
): Promise<VerifyOtpResult> {
  const response = await postJson("/api/v1/auth/verify-otp", {
    email: normalizeEmail(email),
    otp: otp.trim(),
  });
  const body = await response.clone().json().catch(() => null);

  if (response.ok && body?.success) {
    const user = (body?.data as { user?: AuthedUser } | null)?.user ?? null;
    return { ok: true, user };
  }

  return {
    ok: false,
    status: response.status,
    invalidCode: response.status === 400,
    serverMessage:
      typeof body?.message === "string" ? body.message : null,
    response,
  };
}

/**
 * Creates the account. The server answers `{success:true, data:{email}}`.
 *
 * The message it returns says a code was sent. Whether mail actually went out
 * is the server's business, so this function treats a 201 as "the account
 * exists" and nothing more — the caller moves to the OTP screen either way.
 *
 * `role` is restricted to the two self-service roles. The server's validation
 * schema also accepts MODERATOR and ADMIN, so a caller could otherwise make an
 * ADMIN or MODERATOR account for itself. Server-side that is a privilege
 * escalation; it is blocked here as well so the mistake cannot be made from
 * this UI.
 */
export async function registerAccount(body: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  gender: string;
  role: "CUSTOMER" | "SELLER";
}): Promise<Response> {
  return postJson("/api/v1/auth/register", {
    ...body,
    email: normalizeEmail(body.email),
  });
}