/**
 * The API calls this app makes, in one file. Everything goes through
 * `apiUrl()` (`lib/core/api-url.ts`), which points at the local server in
 * `next dev` and at the live API in production — `lib/core/env.ts` owns the
 * addresses.
 *
 * The server runs better-auth and exposes it under two prefixes that share
 * ONE user and session store:
 *
 * - `/api/auth/*`    — better-auth's own routes: sign-in/email (login),
 *                      get-session, social sign-in.
 * - `/api/v1/auth/*` — the hand-written REST routes: register, resend-otp,
 *                      verify-otp (the registration / email-verification
 *                      flow).
 *
 * LOGIN uses `/api/auth/sign-in/email`. That is what fixes the "wrong
 * password gets an OTP" bug from the frontend's side: the API checks the
 * password first and answers a plain 401 when it does not match, so no OTP
 * email is ever sent for a failed login.
 *
 * The server runs `requireEmailVerification: true`, so a new account has to
 * verify its address before it can sign in — that is why registration ends in
 * the resend-otp/verify-otp pair below. That registration flow is out of
 * scope for this task and is left untouched.
 */

import { apiUrl } from "@/lib/core/api-url";
import { readApiError } from "@/lib/core/api-error";

/**
 * Kept for callers that want to know an API origin exists. It always does:
 * `lib/core/env.ts` resolves one for every environment (local in `next dev`,
 * the live API in production).
 */
export function isApiConfigured(): boolean {
  return true;
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
 * There is no base-URL check inside this file: `apiUrl()` in
 * `lib/core/api-url.ts` always returns a usable origin (see
 * `lib/core/env.ts`).
 */

type Json = Record<string, unknown>;

async function postJson(path: string, body: Json): Promise<Response> {
  return fetch(apiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // The session cookie belongs to the API's host; `include` sends and
    // stores it on this cross-origin request.
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
  | { ok: true }
  | { ok: false; status: number; message: string };

/**
 * Signs the user in with email + password against the API.
 *
 *   POST /api/auth/sign-in/email
 *
 * The server checks the password first and answers
 * `401 "Invalid email or password"` when it does not match. A wrong password
 * NEVER sends an OTP email, and there is no "verify email" step that starts
 * from here. Failed responses come back as a ready-to-show `message` — this
 * function never throws.
 *
 * On success the server has already set the session cookie; there is nothing
 * in the body the caller needs, so `ok: true` is enough — the caller
 * redirects to `/dashboard`, whose layout resolves the role from the session.
 */
export async function loginWithPassword(
  email: string,
  password: string,
): Promise<LoginResult> {
  const response = await postJson("/api/auth/sign-in/email", {
    email: normalizeEmail(email),
    password,
  });

  if (response.ok) {
    return { ok: true };
  }

  return {
    ok: false,
    status: response.status,
    message: await readApiError(
      "sign-in",
      response,
      "Invalid email or password.",
    ),
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
  role: "CUSTOMER" | "SELLER";
}): Promise<Response> {
  return postJson("/api/v1/auth/register", {
    ...body,
    email: normalizeEmail(body.email),
  });
}
