/**
 * The API calls this app makes, in one file. Everything goes through
 * `apiUrl()` (`lib/core/api-url.ts`), which points at the local server in
 * `next dev` and at the live API in production — `lib/core/env.ts` owns the
 * addresses.
 *
 * The server runs better-auth and exposes it under two prefixes that share
 * ONE user and session store:
 *
 * - `/api/auth/*`    — better-auth's own routes: get-session, social sign-in.
 * - `/api/v1/auth/*` — the hand-written REST routes: register, resend-otp,
 *                      verify-otp, and login.
 *
 * Login uses the server's `/api/v1/auth/login` wrapper so account verification
 * and status checks run in addition to password validation. The server checks
 * the password first, so an incorrect password cannot trigger an OTP email.
 *
 * The server runs `requireEmailVerification: true`, so a new account has to
 * verify its address before it can sign in — that is why registration ends in
 * the resend-otp/verify-otp pair below. That registration flow is out of
 * scope for this task and is left untouched.
 */

import { apiUrl } from "@/lib/core/api-url";
import { apiFetch } from "@/lib/core/api-fetch";
import { readApiError } from "@/lib/core/api-error";
import { getSession } from "@/lib/core/session";

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
  return apiFetch(apiUrl(path), {
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
 *   POST /api/v1/auth/login
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
  const response = await postJson("/api/v1/auth/login", {
    email: normalizeEmail(email),
    password,
  });

  if (response.ok) {
    const session = await getSession();
    if (!session.user) {
      return {
        ok: false,
        status: response.status,
        message:
          "The server accepted your login but did not establish a session. Please try again.",
      };
    }

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

      serverMessage: string | null;

      invalidCode: boolean;

      response: Response;
    };


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
