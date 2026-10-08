# Login, Register, OTP and RBAC — what was broken and what each piece does

This is a plain-language walkthrough of the sign-in system: how it works, what
was broken, and what each function is for. Written to be read top to bottom.

---

## 1. How the whole thing fits together

There are two projects. Neither one stores the session on its own.

| Project | Folder | Runs on | Job |
|---|---|---|---|
| Client (this one) | `trustpass-client` | `localhost:3000` | The screens and forms |
| Server | `trust-pass-server` | `localhost:5000` | The database, the session, the emails |

The client is told where the server is with one variable:

```
NEXT_PUBLIC_BASE_URL=http://localhost:5000
```

That is the only environment variable the client reads.

**The session lives only on the server.** When you log in, the server creates a
session row in Postgres and sends back a `Set-Cookie` header. The cookie is
`httpOnly`, which means JavaScript cannot read it — not the client, not
anything else in the browser tab. Every later request works because the
browser attaches the cookie automatically:

```ts
fetch(`${API}/api/v1/...`, { credentials: "include" })
```

`credentials: "include"` is what carries the cookie to the server. If that one
option is missing, the user appears logged out on every call.

Because the cookie belongs to the server's domain, the client app cannot check
it in `proxy.ts`. **The real permission check is on the server**, in
`src/app/middlewares/auth.ts`.

---

## 2. The register + verify flow

Registration is two steps, because the server sets
`requireEmailVerification: true`. An account that has not verified its email
cannot sign in at all.

```
Step 1  POST /api/v1/auth/register      → account created, OTP emailed
Step 2  POST /api/v1/auth/verify-otp    → email verified AND user signed in
```

### The bug that broke step 2

`verify-otp` returned HTTP 200 with the message "Email verified. You are now
signed in." — but no session cookie was ever sent.

The cause was in `src/app/libs/auth.ts`. better-auth only creates a session
during email verification when this switch is on:

```ts
emailVerification: {
  autoSignInAfterVerification: true,   // was missing entirely
}
```

Without it, better-auth marks the address verified and returns
`{ status: true, token: null, user }`. No token, no cookie. So the user
verified their code and was still not signed in — the form had to dump them
back on the login screen to type their password again.

On top of that, `auth.service.ts` was reading the user out of the response and
then throwing the value away, so the response contained no user either. Fixed by
turning the switch on and returning `user` in the body.

### Gmail OTP delivery

Sending works through `src/app/utils/email.ts` using nodemailer with your Gmail
SMTP settings from `.env`:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=<16-character Google App Password>
```

`SMTP_PASS` must be an **App Password**, not your normal Google password. To
create one: Google Account → Security → 2-Step Verification → App passwords.
Gmail also refuses plain passwords on port 587, so the app password is required.

The code itself is generated and stored by the better-auth `emailOTP` plugin
(`src/app/libs/auth.ts`). It lives in the `verification` table with the
identifier `email-verification-otp-<email>`, and expires after 10 minutes.

#### Why it looked like no email was ever sent

Two things were fixed here, both in `src/app/utils/email.ts` and the
`sendVerificationOTP` callback in `src/app/libs/auth.ts`:

1. **The send was invisible.** The success line was commented out, so a mail
   that failed produced no output at all and the whole feature just looked
   broken. It is now logged:

   ```
   [email] "Verify your email" -> someone@gmail.com (id <...@gmail.com>)
   [email] FAILED "Verify your email" -> someone@gmail.com: 535 auth failed
   ```

   The `FAILED` line comes from a `try/catch` around the `sendEmail` call. It
   catches and logs but does **not** re-throw, on purpose: the user row is
   already written by the time the mail goes out, so re-throwing would fail
   `/register` and the next attempt would hit the "email already exists" 409,
   which looks like a completely different bug. The OTP is still saved, so once
   SMTP is fixed the Resend button on the verification screen delivers it.

2. **No plain-text part.** The message only had an HTML body. Gmail scores
   HTML-only mail as junk far more often, which is a common reason a working
   OTP ends up in Spam. It now sends `text` alongside `html`.

To confirm delivery without the log, Gmail must answer `250 2.0.0 OK`. Checking
that is enough — if Gmail accepted it, the problem is Spam/Promotions or the
wrong inbox, not the code. Note the mail goes to the **address being
registered**, which is not necessarily `SMTP_USER`.

---

## 3. The bug that logged everybody out with a 500

The console showed:

```
GET http://localhost:5000/api/auth/get-session 500 (Internal Server Error)
  getSession @ session.ts:65
```

Server log showed the cause:

```
Error: Invalid Base64 character: .
  at base64Decode (@better-auth/utils/dist/base64.mjs:38:13)
  at decodeCookieCache (better-auth/dist/cookies/index.mjs:155:79)
  at session.mjs:49
```

**What was happening.** better-auth keeps two session cookies. `session_token`
is the real one. `session_data` is a *copy* of the session so that `get-session`
can skip the database — that is the `session.cookieCache` option. When decoding
that copy fails, better-auth 1.7.5 **throws** instead of returning "no cache".

Reproduced exactly:

```bash
# a valid session_token + a session_data cookie it cannot decode
curl -H "Cookie: better-auth.session_token=$TOK; better-auth.session_data=stale.value.here" \
     http://localhost:5000/api/auth/get-session
# -> 500
```

A stale `session_data` cookie — left over from an older server config or a
different `BETTER_AUTH_SECRET` — makes **every** `get-session` answer 500. The
client reads a 500 as "no session", so the navbar, the dashboard and all role
checks break for anyone holding that cookie.

**The fix** was to set `session.cookieCache.enabled: false` in
`src/app/libs/auth.ts`. It is only a speed optimisation; the session token
cookie is still the real truth, so turning it off costs one extra database read
per `get-session` and nothing else. With it off better-auth never enters that
decode path:

```bash
# same request, same stale cookie
curl -H "Cookie: better-auth.session_token=$TOK; better-auth.session_data=stale.value.here" \
     http://localhost:5000/api/auth/get-session
# -> 200, and the real session comes back
```

No client change was needed for this one.

---

## 4. The bug where the browser could not see the login result

Even after the server fix, the client still could not tell that sign-in
worked. `lib/core/auth-api.ts` was checking:

```ts
const setCookie = response.headers.get("set-cookie") !== null;
```

**Browsers forbid scripts from reading the `Set-Cookie` response header.** It
is not exposed to `fetch` at all. So this check always evaluated to `false` in a
real browser, and the form did this on every successful verification:

```
✅ "Email verified!"
❌ ...then immediately "Enter your password to finish signing in."
```

The code worked perfectly under curl and never worked in a browser — which is
why it looked fine while being tested.

**The fix** is to stop sniffing headers and use what the server actually sends
back. Both endpoints now return the signed-in user:

```ts
const user = body?.data?.user ?? null;
if (response.ok && body?.success) return { ok: true, user };
```

The role in that user decides where to send them:

```ts
router.replace(homeForRole(result.user?.role));
```

`homeForRole` lives in `lib/core/roles.ts` and maps each role to its own
dashboard.

---

## 5. The bug that sent the user back to sign-in after verifying

Even with the redirect target correct, verifying an OTP still dropped the user
on `/auth/login`.

**What happened.** `RegistrationForm` calls `router.replace(homeForRole(role))`,
which lands on `/dashboard/customer`. The `/dashboard` **layout** then mounts and
runs this effect, which was:

```ts
if (isPending || !isAuthenticated) {
  router.replace("/auth/login");
  return;
}
```

`isPending` is `true` on the very first render of `useAuth()` — it is still
fetching the session. So on arrival `isPending` was true, the effect treated
*"we don't know yet"* as *"signed out"*, and redirected to `/auth/login` before
the session request had even finished. The server had signed the user in
correctly; the client threw the answer away.

`app/dashboard/page.tsx` already had the right shape for the same reason:

```ts
if (isPending) return;          // wait for the answer
if (!isAuthenticated) { ... }   // only now decide
```

**The fix** was to make the layout match:

```ts
if (isPending) return;

if (!isAuthenticated) {
  router.replace("/auth/login");
  return;
}
```

The remaining `isPending ||` in that file is the render guard that shows
"Loading...", which is correct — it must hold the UI while loading.

This is why "wait for the answer, then decide" and "assume not signed in" are
different things. Any guard that redirects has to make the same distinction.

---

## 6. RBAC — the two holes

### Hole 1: admin routes had no auth check at all

`src/app/v1/modules/admin/admin.route.ts` registered four endpoints with **no
middleware**:

```ts
router.get("/users", AdminController.getAdminUsers);   // no auth()
```

Confirmed by testing with no cookie and no login at all:

```
GET /api/v1/admin/users       → 200   (anyone could read every user)
GET /api/v1/admin/reports     → 200
GET /api/v1/admin/businesses  → 200
GET /api/v1/admin/dashboard   → 200
```

The fix applies the check once for the whole file:

```ts
router.use(auth("ADMIN"));
```

`router.use` runs for every request that reaches this router, so a new endpoint
added later is protected by default instead of being left open by accident.

### Hole 2: anyone could register themselves as admin

The register schema accepted all four roles:

```ts
role: z.enum(["CUSTOMER", "SELLER", "MODERATOR", "ADMIN"])
```

The signup form only showed Customer and Seller, so it looked safe — but the
form is not the boundary. Anyone can call the endpoint directly:

```
POST /api/v1/auth/register  {"role":"ADMIN"}  → 201, account created with role ADMIN
```

Confirmed: the account existed in the database with `role: "ADMIN"`.

Fixed in two places, so the rule does not depend on validation order:

```ts
// auth.validation.ts — schema only allows self-service roles
role: z.enum(["CUSTOMER", "SELLER"]).optional(),

// auth.service.ts — the line that actually decides
const safeRole = payload.role === "SELLER" ? "SELLER" : "CUSTOMER";
```

Admin and moderator accounts are granted later by an existing admin through
`PATCH /api/v1/users/:id/role`, which is protected by `auth("ADMIN")`.

### CORS, found on the way

`src/app.ts` fell back to `origin: true` when `CLIENT_URL` was unset. That
reflects **any** requesting origin back as `Access-Control-Allow-Origin`, and
combined with `credentials: true` it lets any website make logged-in requests
using a visitor's session cookie. Replaced with an explicit allowlist of the
real frontend origins.

---

## 7. Function reference

### Client — `lib/core/auth-api.ts`

| Function | What it does |
|---|---|
| `isApiConfigured()` | True when `NEXT_PUBLIC_BASE_URL` is set. Lets a form show a message instead of crashing. |
| `normalizeEmail(email)` | Trims and lowercases. The server rejects untrimmed input, so a stray space would break every later call. |
| `loginWithPassword(email, password)` | `POST /api/v1/auth/login`. On success returns the user (and the role) so the caller can redirect to the right dashboard. |
| `registerAccount(body)` | `POST /api/v1/auth/register`. Only sends `CUSTOMER` or `SELLER` as the role. |
| `resendOtp(email)` | `POST /api/v1/auth/resend-otp`. Re-sends the code. Answers with a deliberately vague message so it cannot be used to discover which emails have accounts. |
| `verifyOtp(email, otp)` | `POST /api/v1/auth/verify-otp`. Verifies the code **and** signs the user in. Returns the user on success. |

### Client — `lib/core/session.ts`

| Function | What it does |
|---|---|
| `getSession()` | `GET /api/auth/get-session`. Returns `{ session, user }`. Never throws — a network failure resolves to "signed out" rather than crashing the page. |
| `signOut()` | `POST /api/v1/auth/logout`. Deletes the session on the server. |
| `signInWithSocial(provider, callbackURL)` | Asks the server for the Google/Facebook authorize URL and sends the browser there. |

### Client — `lib/core/roles.ts`

The single place that decides what each role may see.

| Function | What it does |
|---|---|
| `isApiRole(value)` | Confirms a string is a real role. Anything unknown becomes `CUSTOMER`, so a bad value can never widen access. |
| `homeForRole(role, pathname?)` | The dashboard for a role. Keeps an allowed deep link, otherwise sends to the role's home. |
| `canAccessDashboardPath(path, role)` | Whether a role may view a `/dashboard/*` path. Unknown dashboard pages are denied rather than exposed. |
| `roleLabel(role)` | Display name for the sidebar. |

> This file is **user experience, not security**. It stops people being shown
> screens they cannot use. The actual boundary is the server's `auth()`
> middleware, which holds even if a user edits the URL.

### Client — `hooks/use-auth.ts`

`useAuth()` returns `user`, `role`, `isAuthenticated`, `isPending`, `refresh`.
It re-reads the session when the tab regains focus, so a session that expired in
another tab does not leave this one showing a stale user.

### Server — `src/app/libs/auth.ts`

The better-auth setup. `autoSignInAfterVerification` is what makes OTP
verification sign the user in. `trustedOrigins` lists the browsers allowed to
send credentialed requests.

### Server — `src/app/middlewares/auth.ts`

`auth(...roles)` runs on every protected request:

1. Reads the session. No session → **401**.
2. Loads the user. Missing → **401**.
3. Checks status. Blocked/suspended/deleted → **403**.
4. Checks the role. Not in the allowed list → **403**.

The role is re-read from the database on every request rather than trusted from
the cookie, so an admin demoting someone takes effect on their very next
request.

### Server — `src/app/v1/modules/auth/auth.service.ts`

| Function | What it does |
|---|---|
| `registerUser(payload)` | Rejects a duplicate email (409), creates the account, forces a safe role, emails the OTP. |
| `verifyEmailOtp(email, otp)` | Verifies the code. Returns the user and forwards the session cookie. |
| `resendOtp(email)` | Re-sends the code for an unverified account. |
| `loginUser(payload, headers)` | Refuses unverified (403, "check your inbox") and blocked/suspended accounts, then signs in. |
| `logoutUser(headers)` | Revokes the session. |
| `changePassword(payload, headers)` | Changes the password and revokes other sessions. |

### Server — `src/app/utils/email.ts`

| Function | What it does |
|---|---|
| `sendEmail({ to, subject, otp, appName, expirationMinutes })` | Builds the HTML **and** plain-text body, sends it through nodemailer, then logs `[email] "subject" -> to (id ...)`. Throws if SMTP rejects it, so the caller in `libs/auth.ts` can log the reason. |

---

## 8. Running it locally

**Terminal 1 — the server:**

```bash
cd ~/Desktop/Projects/trust-pass-server
npm run dev          # http://localhost:5000
```

Its `.env` must have:

```
BETTER_AUTH_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
```

> `BETTER_AUTH_URL` is the **server's** address, not the client's. It was
> pointing at the frontend URL, which is wrong — better-auth builds its cookie
> and OAuth callback URLs from it.

**Terminal 2 — the client:**

```bash
cd ~/Desktop/Projects/trustpass-client
npm run dev          # http://localhost:3000
```

With `NEXT_PUBLIC_BASE_URL=http://localhost:5000` in `.env`.

Note: `NEXT_PUBLIC_*` values are inlined when the app is **built**, not when it
runs. On Vercel, set it in the project settings — changing only the file will
not take effect.

---

## 9. Test results

Checked against the running server, with a real database and real cookies.

| Check | Result |
|---|---|
| Register creates account, emails OTP | 201 ✅ |
| Verify OTP marks email verified | `emailVerified: true` ✅ |
| Verify OTP sets session cookie | 2 `Set-Cookie` headers ✅ |
| Session readable after verify | user + role returned ✅ |
| Session readable immediately after verify, no re-login needed | user + role returned ✅ |
| Login returns user with role | ✅ |
| Register with `role: ADMIN` | 400 rejected ✅ |
| Admin routes, no session | 401 ✅ |
| Admin routes, CUSTOMER session | 403 ✅ |
| Admin routes, ADMIN session | 200 ✅ |
| CUSTOMER on SELLER-only route | 403 ✅ |
| CUSTOMER on MODERATOR-only route | 403 ✅ |
| CUSTOMER on any-auth route | 200 ✅ |
| Blocked account login | 403 with clear message ✅ |
| CORS from `localhost:3000` | allowed ✅ |
| CORS from unknown site | no headers returned ✅ |
| `get-session` with a stale `session_data` cookie | 200, session still returned ✅ (was 500) |
| `get-session` with a corrupt `session_data` cookie | 200 ✅ |
| SMTP send | Gmail replies `250 2.0.0 OK` ✅ |
| Email send is logged | `[email] "Verify your email" -> ...` ✅ |
| Client `tsc --noEmit` | passes ✅ |
| Client `npm run build` | passes ✅ |
| Server `tsc --noEmit` | passes ✅ |

Test accounts were removed from the database afterwards.

---

## 10. What is still worth knowing

- **The admin dashboard page shows hard-coded numbers.** `app/dashboard/admin/page.tsx` uses dummy stats (`1,250` users, etc.) instead of calling `/api/v1/admin/dashboard`. The endpoint is fixed and working — the page just does not use it yet.
- **Email is only checked for shape**, not for real deliverability. A typo like `user@gmial.com` still gets a 201. Real confirmation is the click on the emailed code.
- **`getSession()` cannot tell "logged out" from "server unreachable".** Both show no user, which is the safe default but makes outages look like sign-outs.
- **Rate limiting** is set on better-auth's own OTP routes. The `/api/v1/auth/*` wrappers in front of them are not separately limited.

---

## 11. 2026-10-06 — the four reported problems and what was done

Four things were reported broken, each was reproduced, root-caused and fixed:

### 11.1 "A user can sign in with a wrong password, and it emails an OTP" — FIXED (server)

Reproduced: logging in with a **wrong** password on an **unverified** account
answered `403 "Please verify your email before signing in. Check your inbox for
the OTP."` — the password was never checked. The login screen switched to the
OTP step, the code was emailed to the address, and finishing the OTP signed the
visitor in. Nobody needed the password.

Root cause (`loginUser` in `trust-pass-server`): the `emailVerified` check ran
**before** better-auth ever saw the password.

Fix (`src/app/v1/modules/auth/auth.service.ts`): the password is verified first
(via `auth.api.signInEmail`). better-auth only answers
`403 EMAIL_NOT_VERIFIED` after the password matched, which is still translated
to the friendly message. Wrong password now answers `401` regardless of
verification state.

Deploy needed: this is server code — push `trust-pass-server` to apply it.

### 11.2 "After login I land back on /auth/login" — FIXED (client)

Reproduced in a real browser (headless Chrome): with third-party cookies
blocked, login "succeeded" (`200`, `Set-Cookie` was even sent by the server)
but the browser **refused to store** the cookie — 0 cookies kept. The next
`get-session` read "no user", and the dashboard bounced the user to
`/auth/login`. With third-party cookies allowed it worked, which is exactly the
"works for me, breaks for others" symptom.

Root cause: the client lived on one origin (`localhost:3000`,
`trustpass-client.vercel.app`) and the API on another
(`trust-pass-server.vercel.app`). The session cookie was cross-site, so any
browser that blocks third-party cookies (Safari, Firefox, Brave, Chrome's
tracking protection...) dropped it.

Fix (`next.config.ts` + `lib/core/api-url.ts`): the browser now calls
**relative** `/api/...` paths, and Next.js `rewrites()` forwards them to the
API server. To the browser the request is first-party, so the cookie is stored
and sent in every browser. The dashboard no longer bounces — verified with
third-party cookies blocked.

### 11.3 "The second OTP code arrives too late" — FIXED (server) + UX note

Reproduced: every Resend press **invalidated the previous code** (better-auth's
default `resendStrategy: "rotate"`). The second email holds a *new* code, but
if it arrives a minute behind the first, the user types the newest code they
have and gets `Invalid OTP` — and has to wait for yet another one. That is the
"2nd OTP comes too late" experience.

Fix (`src/app/libs/auth.ts`): `emailOTP` now uses `resendStrategy: "reuse"` —
resends mail the **same** code until it expires or is used up, so any code that
arrives works.

Deploy needed: server code again — push `trust-pass-server`.

Honest caveat: the request round-trip itself is ~2–4s (SMTP happens inside the
call on Vercel), and inbox delivery past that is Gmail's timing, not the app's.
The fix removes the "your newest code does not work" loop.

### 11.4 "There is no Forgot password option" — ADDED (client)

New flow, fully client-side, using the server's email-OTP routes (the default
link-based reset answers `400 RESET_PASSWORD_DISABLED` on this server, so a
6-digit-code reset is used instead):

- `/auth/forgot-password` — enter the address; a "Reset your password" code is
  emailed.
- `/auth/reset-password?email=...` — code + new password
  (`POST /api/auth/email-otp/request-password-reset` →
  `POST /api/auth/email-otp/reset-password`).
- `/auth/reset-password?token=...` still handles the token/link flow for when
  the server ever enables `sendResetPassword`.
- "Forgot password?" link added to the sign-in form.

New files: `lib/core/password-api.ts` (two new functions),
`components/password/ForgotPasswordForm.tsx`, `ResetWithOtpForm.tsx`,
`ResetPasswordSwitch.tsx`, pages under `app/auth/forgot-password` and
`app/auth/reset-password`.

Verified end to end in a browser: forgot-password → code read from the
database → reset → sign-in with the new password → dashboard.

### Verified after the fixes

- Wrong password on unverified account → `401` (was `403` OTP handout).
- Correct password on unverified account → `403` "please verify".
- Resend twice → same OTP stays valid (reuse).
- Full forgot-password flow → new password signs in, old one answers `401`.
- Login in a browser with third-party cookies blocked → stays on the dashboard.
- `tsc --noEmit` (client + server), ESLint, `npm run build` → all pass.

Test accounts were removed from the database afterwards.