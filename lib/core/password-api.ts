/**
 * The password endpoints this app calls, in one small file. Every request
 * goes to the LIVE API (`lib/core/api-url.ts` decides the address — never a
 * local server).
 *
 *   POST /api/auth/request-password-reset   public. Emails a one-time
 *                                            password-reset link.
 *   POST /api/auth/reset-password           public. Sets a new password using
 *                                            the token from that link.
 *   POST /api/auth/change-password          signed-in only. Needs the current
 *                                            password AND the session cookie.
 *
 * "Forgot password?" is the LINK flow:
 *   1. this form posts the email to `/request-password-reset`;
 *   2. the API emails a link to this app's reset page,
 *      `/auth/reset-password?token=...`;
 *   3. `ResetPasswordForm` posts that token + the new password to
 *      `/reset-password`.
 *
 * Why `/api/auth/...` and not `/api/v1/auth/...` like the registration
 * endpoints? Because the server mounts better-auth under `/api/auth` and the
 * hand-written REST routes under `/api/v1`. Reset and change password are
 * better-auth's own routes, so they live under the first prefix.
 *
 * --------------------------------------------------------------------------
 * HOW TO DEBUG
 * --------------------------------------------------------------------------
 * Every call logs `[password-api] ...` to the browser console — filter the
 * console on `password-api`. Failed responses log the untouched server body
 * through `readApiError` (see `lib/core/api-error.ts`), so the raw payload is
 * always visible in development.
 *
 * These functions NEVER throw. Every problem comes back as
 * `{ ok: false, status, message }`, so a form only ever needs one `if`.
 * `status: 0` means the request never reached the server (server off, CORS,
 * no network).
 */

import { readApiError, safeThrownError } from "@/lib/core/api-error";
import { apiUrl } from "@/lib/core/api-url";
import { apiFetch } from "@/lib/core/api-fetch";

const RESET_PASSWORD_PATH = "/api/auth/reset-password";
const CHANGE_PASSWORD_PATH = "/api/auth/change-password";
const REQUEST_PASSWORD_RESET_PATH = "/api/auth/request-password-reset";

// The email-OTP reset flow. The link flow above is what the Live API *used*
// to offer, but that server answers `RESET_PASSWORD_DISABLED` for
// `/request-password-reset` (no `sendResetPassword` callback is configured),
// so a link can never be sent. The `emailOTP` plugin IS enabled, and these
// two endpoints are the reset path that actually works end to end:
//   1. request a code  -> POST /api/auth/email-otp/request-password-reset
//   2. set the password -> POST /api/auth/email-otp/reset-password
const REQUEST_RESET_OTP_PATH = "/api/auth/email-otp/request-password-reset";
const RESET_PASSWORD_OTP_PATH = "/api/auth/email-otp/reset-password";

/** What both functions return. Narrow with `if (!result.ok)`. */
export type PasswordApiResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

/**
 * The single place every endpoint builds its request from.
 *
 * The API origin comes from `lib/core/env.ts` via `apiUrl()`. `credentials:
 * "include"` is mandatory: the session cookie belongs to the API's host,
 * and without it `/change-password` always answers 401 even when the user is
 * signed in.
 */
async function postJson(
  path: string,
  body: Record<string, unknown>,
): Promise<Response> {
  const url = apiUrl(path);

  // Field NAMES only — the values are passwords, they never go to the console.
  console.debug(`[password-api] POST ${path}`, Object.keys(body));

  return apiFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
}

/** Shared success/failure handling so the three exported functions stay tiny. */
async function toResult(
  path: string,
  response: Response,
  fallback: string,
): Promise<PasswordApiResult> {
  console.debug(`[password-api] ${path} -> ${response.status}`);

  if (response.ok) return { ok: true };

  return {
    ok: false,
    status: response.status,
    message: await readApiError(path, response, fallback),
  };
}

/**
 * POST /api/auth/reset-password
 *
 * Body (better-auth's schema):
 *   { token: string, newPassword: string }
 *
 * `token` is the value the reset email link carries as `?token=...`. It is
 * single use: the server deletes it the moment the password is changed, so a
 * second submit of the same page answers 400 — which is expected, not a bug.
 */
export async function resetPassword(input: {
  token: string;
  newPassword: string;
}): Promise<PasswordApiResult> {
  try {
    const response = await postJson(RESET_PASSWORD_PATH, {
      token: input.token,
      newPassword: input.newPassword,
    });

    return await toResult(
      RESET_PASSWORD_PATH,
      response,
      "Could not reset your password. The link may have expired — request a new one.",
    );
  } catch (error) {
    // fetch only rejects when no answer came back at all.
    return {
      ok: false,
      status: 0,
      message: safeThrownError(
        "reset-password",
        error,
        "Could not reach the server. Please check your connection and try again.",
      ),
    };
  }
}

/**
 * POST /api/auth/change-password
 *
 * Body (better-auth's schema):
 *   { newPassword: string, currentPassword: string, revokeOtherSessions?: boolean }
 *
 * Needs a live session cookie. `revokeOtherSessions: true` signs every OTHER
 * device out and issues a fresh cookie for this one — the safe default after
 * a password change.
 *
 * 401 gets its own text: the generic one ("email or password is incorrect")
 * is written for the login screen and would be misleading here.
 */
export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions: boolean;
}): Promise<PasswordApiResult> {
  try {
    const response = await postJson(CHANGE_PASSWORD_PATH, {
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
      revokeOtherSessions: input.revokeOtherSessions,
    });

    if (response.status === 401) {
      console.debug(`[password-api] ${CHANGE_PASSWORD_PATH} -> 401`);
      return {
        ok: false,
        status: 401,
        message: "Your session has expired. Please sign in again.",
      };
    }

    return await toResult(
      CHANGE_PASSWORD_PATH,
      response,
      "Could not change your password.",
    );
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message: safeThrownError(
        "change-password",
        error,
        "Could not reach the server. Please check your connection and try again.",
      ),
    };
  }
}

/**
 * POST /api/auth/request-password-reset
 *
 * Body (better-auth's schema):
 *   { email: string, redirectTo?: string }
 *
 * Asks the API to email a one-time password-reset LINK to the address.
 * `redirectTo` is this app's own reset page — the link in the email points
 * there and arrives with `?token=...` (or `?error=...` when the token is bad
 * or expired).
 *
 * The server answers success for BOTH a known and an unknown address, so this
 * endpoint can never be used to probe which emails have accounts — the caller
 * must not treat a success as proof the address exists.
 *
 * Returns the raw Response so the caller decides what to show.
 */
export async function requestPasswordReset(input: {
  email: string;
  redirectTo: string;
}): Promise<Response> {
  return postJson(REQUEST_PASSWORD_RESET_PATH, {
    email: input.email,
    redirectTo: input.redirectTo,
  });
}

/**
 * POST /api/auth/email-otp/request-password-reset
 *
 * Body: { email }
 *
 * Emails a 6-digit reset code. This is the endpoint the "Forgot password?"
 * form uses — see the note next to `REQUEST_RESET_OTP_PATH` at the top of this
 * file for why the LINK flow is not used.
 *
 * Returns the raw Response so the caller decides what to show. The server
 * answers success for both a known and an unknown address, so a success is
 * NOT proof the address exists.
 */
export async function requestPasswordResetOtp(
  email: string,
): Promise<Response> {
  return postJson(REQUEST_RESET_OTP_PATH, {
    email: email.trim().toLowerCase(),
  });
}

/**
 * POST /api/auth/email-otp/reset-password
 *
 * Body: { email, otp, password }
 *
 * Verifies the code AND sets the new password in a single call (better-auth's
 * email-OTP plugin). A wrong or expired code answers 400 — `readApiError`
 * turns that into "Invalid OTP" for the user. The code is single use.
 */
export async function resetPasswordWithOtp(input: {
  email: string;
  otp: string;
  password: string;
}): Promise<PasswordApiResult> {
  try {
    const response = await postJson(RESET_PASSWORD_OTP_PATH, {
      email: input.email.trim().toLowerCase(),
      otp: input.otp.trim(),
      password: input.password,
    });

    return await toResult(
      RESET_PASSWORD_OTP_PATH,
      response,
      "Could not reset your password. Check the code and try again.",
    );
  } catch (error) {
    // fetch only rejects when no answer came back at all.
    return {
      ok: false,
      status: 0,
      message: safeThrownError(
        "reset-password-otp",
        error,
        "Could not reach the server. Please check your connection and try again.",
      ),
    };
  }
}