/**
 * Auth calls that must go to the API server.
 *
 * The server runs better-auth and exposes it under two prefixes that share
 * ONE user and session store:
 *
 * - `/api/v1/auth/*` — the REST surface this app uses (register, login).
 *   `resend-otp` and `verify-otp` exist on the server but are NOT called from
 *   here; see the commented-out block further down.
 * - `/api/auth/*`   — better-auth's own routes (get-session, sign-in/social).
 *   Only `get-session` and the social buttons need these.
 *
 * Login via `/api/v1/auth/login` issues the `__Secure-better-auth.session_token`
 * cookie, which is the same cookie better-auth's `get-session` reads, so
 * `useAuth()` works after a password login.
 *
 * Server behaviour this file has to work around:
 *
 * The CORS allowlist covers `http://localhost:3000` and the deployed client
 * origin. Any other origin (127.0.0.1, a LAN IP) fails the preflight and
 * surfaces as `TypeError: Failed to fetch`. That is server-side; this file
 * cannot fix it.
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

export type LoginResult =
  | { ok: true }
  | {
      ok: false;
      status: number;
      /**
       * 403 from the server. Two unrelated causes, and this client cannot tell
       * them apart: the account's `emailVerified` flag is unset, or the account
       * is BLOCKED/SUSPENDED. Both are surfaced as an unverified-account
       * message by `LoginForm`, which will be wrong for the blocked case.
       */
      needsVerification: boolean;
      /** Raw `message` from the body, for the safe-message layer to vet. */
      serverMessage: string | null;
    };

/** Signs in with email + password. The server sets the session cookie. */
export async function loginWithPassword(
  email: string,
  password: string,
): Promise<LoginResult> {
  const response = await postJson("/api/v1/auth/login", {
    email: normalizeEmail(email),
    password,
  });
  const body = await response.clone().json().catch(() => null);

  if (response.ok && body?.success) return { ok: true };

  return {
    ok: false,
    status: response.status,
    needsVerification: response.status === 403,
    serverMessage:
      typeof body?.message === "string" ? body.message : null,
  };
}

/* ---------------------------------------------------------------------------
 * OTP ENDPOINTS — COMMENTED OUT
 * ---------------------------------------------------------------------------
 * Disabled while the server has no working mail transport. `SMTP_HOST`,
 * `SMTP_PORT`, `SMTP_USER` and `SMTP_PASS` are unset on the deployed API, so
 * `sendEmail()` throws inside nodemailer and better-auth's
 * `runInBackgroundOrAwait` discards it — `register` still answers `201` and
 * `resend-otp` still answers `200`, but no mail is ever produced.
 *
 * `resendOtp`:
 *
 * export async function resendOtp(email: string): Promise<Response> {
 *   return postJson("/api/v1/auth/resend-otp", {
 *     email: normalizeEmail(email),
 *   });
 * }
 *
 * `verifyOtp`:
 *
 * export async function verifyOtp(email: string, otp: string): Promise<Response> {
 *   return postJson("/api/v1/auth/verify-otp", {
 *     email: normalizeEmail(email),
 *     otp: otp.trim(),
 *   });
 * }
 *
 * To restore: uncomment both functions, then re-enable the OTP steps in
 * `LoginForm.tsx` and `RegistrationForm.tsx`. The server also still enforces
 * `requireEmailVerification: true`, so no account can sign in until either
 * these come back or that flag is turned off. See the note in
 * `LoginForm.tsx` about what a 403 means with OTP off.
 * ------------------------------------------------------------------------ */

/**
 * Creates the account. The server answers `{success:true, data:{email}}`.
 *
 * The message it returns claims a verification code was sent. That is not
 * something the client can confirm — see the block comment above — so this
 * function treats a 201 as "the account exists", nothing more.
 */
export async function registerAccount(body: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  gender: string;
  role: string;
}): Promise<Response> {
  return postJson("/api/v1/auth/register", {
    ...body,
    email: normalizeEmail(body.email),
  });
}