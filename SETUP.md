# How to Set Up TrustPass Client

This guide covers installation, environment configuration, API integration, and the commands used to run and verify the frontend.

---

## Prerequisites

| Requirement | Version / notes |
|---|---|
| Node.js | 20 or newer |
| npm | Ships with Node.js (this repo uses `package-lock.json`) |
| TrustPass API | `trust-pass-server`, running locally or reachable over HTTPS |

The default API is the hosted server at `https://trust-pass-server.vercel.app`. Point `NEXT_PUBLIC_SERVER_URL` at a local server when developing against `http://localhost:5000`.

---

## 1. Installation

Clone the repository, then install dependencies from the lockfile:

```bash
git clone <repository-url>
cd trustpass_client
npm ci
```

Use `npm install` instead of `npm ci` only when you intentionally change `package.json`.

---

## 2. Environment Setup

Create a local environment file from the example:

```bash
cp .env.example .env.local
```

`.env.example` contains:

```env
NEXT_PUBLIC_SERVER_URL=https://trust-pass-server.vercel.app
```

For local backend development:

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:5000
```

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SERVER_URL` | No | `https://trust-pass-server.vercel.app` | Base URL of the TrustPass API |

Notes:

- `NEXT_PUBLIC_SERVER_URL` is read only in `lib/core/env.ts` and `next.config.ts`. Do not assemble API origins anywhere else.
- `NEXT_PUBLIC_*` values are inlined at **build time**. Changing `.env.local` requires restarting `npm run dev`; on Vercel, set the variable in project settings and redeploy.
- Never commit `.env.local` or real secrets.

---

## 3. API Integration

### Base URL resolution

All API origins come from `lib/core/env.ts`:

```ts
export const SERVER_URL = (
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "https://trust-pass-server.vercel.app"
).replace(/\/$/, "");
```

Use `apiUrl()` from `lib/core/api-url.ts` instead of building URLs by hand:

```ts
import { apiUrl } from "@/lib/core/api-url";

const response = await fetch(apiUrl("/api/v1/products"), {
  credentials: "include",
});
```

- **In the browser**, `apiUrl()` returns a relative path such as `/api/v1/products`.
- **On the server**, it returns the absolute URL `${SERVER_URL}/api/v1/products`.

### Same-origin rewrite

`next.config.ts` rewrites every `/api/:path*` request to `${NEXT_PUBLIC_SERVER_URL}/api/:path*`:

```ts
async rewrites() {
  return [
    {
      source: "/api/:path*",
      destination: `${apiServerUrl}/api/:path*`,
    },
  ];
}
```

Browser calls therefore look first-party. This keeps the API's `httpOnly` session cookie working even when the API lives on a different domain or when third-party cookies are blocked.

### Sessions and authorization

- The API issues and owns the session cookie. The client never reads or trusts it directly.
- `useAuth()` calls the API's `get-session` endpoint to resolve the current user and role.
- `app/dashboard/layout.tsx` redirects by role for UX, using `lib/core/roles.ts`.
- The API's own `auth()` middleware is the real authorization boundary.
- `proxy.ts` is intentionally a no-op. Do not add a second session gate there.

### API route families

| Family | Purpose |
|---|---|
| `/api/v1/*` | Hand-written REST routes: auth, businesses, products, categories, payments, notifications, reports, admin |
| `/api/auth/*` | better-auth routes: session, social sign-in, password reset/change |

### API layer conventions

| Concern | Location |
|---|---|
| Reads | `lib/core/*-api.ts` or `lib/*_api/*` |
| Mutations | `lib/*_action/*` server actions using `lib/core/mutations.ts` |
| Fetch wrapper | `lib/core/api-fetch.ts` |
| URL builder | `lib/core/api-url.ts` |
| Query strings | Shared `buildQuery()` helper |
| Error normalization | `lib/core/api-error.ts` |

When integrating a new endpoint:

1. Add the typed function to the matching `lib/core/*-api.ts` or `lib/*_api/*` module.
2. Use `apiUrl()`, `apiFetch()`, and `credentials: "include"`.
3. Handle loading, empty, success, and error states at the component level.
4. Reuse existing types in `types/` instead of duplicating shapes.

---

## 4. Run Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the development server at <http://localhost:3000> |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

Additional verification commands:

```bash
npx next typegen      # Generate Next.js route types (.next/types)
npx tsc --noEmit      # Type-check the whole project
```

> The project does not currently include a unit or end-to-end test runner in `package.json`. Run the commands above plus a manual browser check of the affected flow.

---

## 5. Deployment Notes

- Deploy the frontend on any Node.js host that supports Next.js (for example Vercel).
- Set `NEXT_PUBLIC_SERVER_URL` in the hosting provider's environment settings.
- The frontend and API are deployed independently. The API must allow the frontend origin or rely on the same-origin `/api` rewrite.
- Verify the production build locally before deploying:

```bash
npm run build
npm run start
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Requests go to the hosted API while developing | `.env.local` missing or dev server not restarted | Create `.env.local`, restart `npm run dev` |
| Login succeeds but the dashboard bounces back to login | Browser dropped a cross-site cookie | Confirm browser requests use relative `/api/...` paths and the rewrite is active |
| `LayoutProps` type error | Next.js generated types are missing | Run `npx next typegen`, then `npx tsc --noEmit` |
| `401` / `403` from the API | No session, expired session, or wrong role | Sign in again; verify the account role in the database |
| CORS error | Calling the API origin directly from the browser | Use `apiUrl()` so calls go through the `/api` rewrite |
