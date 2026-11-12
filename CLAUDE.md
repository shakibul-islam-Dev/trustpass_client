@AGENTS.md

# TrustPass Client — Agent Guide

This file is the working reference for AI agents and developers in this repository. Start with [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) for team and branch safety rules, then use this file for structure, architecture, coding conventions, and verification commands.

---

## Project Overview

- **Product:** TrustPass — a digital trust and verification marketplace.
- **This repo:** the Next.js frontend (`trustpass-client`).
- **Backend:** a separate `trust-pass-server` API that owns the database, sessions, email, and authorization.
- **Roles:** `CUSTOMER`, `SELLER`, `MODERATOR`, `ADMIN`.

---

## Folder Structure

```
trustpass_client/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout: providers, theme, toaster
│   ├── page.tsx                      # Public landing page
│   ├── loading.tsx | error.tsx | not-found.tsx | global-error.tsx
│   ├── icon.svg | globals.css
│   ├── auth/                         # login, register, forgot/reset password
│   ├── businesses/                   # directory + [id] detail
│   ├── businessesExplore/            # explore view
│   ├── categories/                   # list + [id] detail
│   ├── products/                     # catalog + [slug] detail
│   ├── pricing/                      # pricing page
│   ├── payment/                      # success / failed result pages
│   └── dashboard/                    # authenticated area
│       ├── layout.tsx                # session + role gate (UX only)
│       ├── page.tsx
│       ├── profile/                  # shared profile management
│       ├── change-password/
│       ├── customer/                 # overview, reports, notifications
│       ├── seller/                   # overview, passport, analytics,
│       │                             # payments, products/[id], settings/*
│       ├── moderator/                # overview, verification-queue, reports,
│       │                             # notifications
│       └── admin/                    # overview, user-management, businesses,
│                                     # products, categories, payments,
│                                     # verification-queue, reports,
│                                     # trust-rules, notifications
│
├── components/                       # Feature components, grouped by domain
│   ├── ui/                           # shadcn/ui primitives
│   ├── shared/                       # navbar, footer, toaster, badges
│   ├── auth/ | otp/ | password/      # auth flows
│   ├── home/ | marketplace/          # public marketing + discovery
│   ├── products/ | business-details/ # product and business UI
│   ├── buisness/                     # business create/update forms
│   ├── pricing/
│   ├── seller/                       # seller dashboard suite
│   ├── admin/                        # admin panel sections
│   ├── customer/                     # customer dashboard sections
│   ├── dashboard/ | profile/ | modal/ | ToggleBar/
│   └── theme-provider.tsx
│
├── hooks/                            # use-auth, useNotifications,
│                                     # usePagination, use-seller-dashboard,
│                                     # use-seller-tier, use-unread-count,
│                                     # use-unread-notifications, use-mobile,
│                                     # use-tilt
│
├── lib/                              # API layer and server actions
│   ├── core/                         # shared foundation
│   │   ├── api-fetch.ts              # fetch wrapper
│   │   ├── api-url.ts | env.ts       # API URL helpers and base URL
│   │   ├── api-error.ts
│   │   ├── auth-api.ts | session.ts | roles.ts
│   │   ├── password-api.ts | profile-api.ts | notification-api.ts
│   │   ├── business-api.ts | product-api.ts | categories-api
│   │   ├── bkash-api.ts              # payments
│   │   ├── mutations.ts | server-api.ts
│   │   └── ...
│   ├── admin_api/ | admin_action/    # admin reads + server actions
│   ├── customer_api/ | customer_action/
│   ├── business-api/ | products-api/
│   ├── seller/server-data.ts         # server-side seller data
│   ├── sidebarData.ts                # dashboard navigation config
│   ├── page-metadata.ts              # SEO metadata
│   └── utils.ts                      # `cn()` and small helpers
│
├── types/                            # shared domain types
│   ├── admin.ts | business.ts | categories.ts | customer.ts
│
├── docs/                             # design blueprint, reports, API gaps
│   ├── DESIGN_BLUEPRINT.md
│   ├── SELLER_DASHBOARD_API_GAPS.md
│   └── reports/
│
├── proxy.ts                          # Next.js 16 proxy — intentionally a no-op
├── next.config.ts                    # rewrites, images, React Compiler
├── eslint.config.mjs
├── postcss.config.mjs
├── tsconfig.json | tsconfig.check.json
├── AGENTS.md | CLAUDE.md
├── PROJECT_CONTEXT.md                # team rules — read first
├── AUTH_AND_RBAC.md
├── sellerDashboardContext.md
└── README.md | SETUP.md | CHANGELOG.md
```

---

## Architecture

### Rendering model

- **App Router with React Server Components.** Pages fetch data on the server where possible.
- Server-side reads use `lib/core/server-api.ts`, `lib/seller/server-data.ts`, and the `lib/*_api/*` modules.
- Client components handle interactivity, forms, filters, and dashboard widgets.

### API access

- The browser calls **relative** `/api/...` paths; `next.config.ts` rewrites them to the API server.
- Server-side code uses the absolute URL from `lib/core/env.ts` because requests do not pass through the browser rewrite.
- Every call goes through `lib/core/api-url.ts` (`apiUrl`) and `lib/core/api-fetch.ts` (`apiFetch`) with `credentials: "include"`.
- Reads live in `lib/core/*-api.ts` or `lib/*_api/*`; mutations live in `lib/*_action/*` server actions.
- Build query strings with the shared `buildQuery()` helper.

### Sessions and authorization

- The API issues an `httpOnly` session cookie and owns the session.
- `useAuth()` reads the session by round-tripping to the API.
- `app/dashboard/layout.tsx` uses `useAuth()` plus `lib/core/roles.ts` to redirect users by role. This is UX only.
- The API's `auth()` middleware is the real authorization boundary.
- `proxy.ts` is deliberately empty; do not add a second session gate.

### Role routing

| Role | Dashboard home | Accessible segments |
|---|---|---|
| `CUSTOMER` | `/dashboard/customer` | customer, profile, change-password |
| `SELLER` | `/dashboard/seller` | seller, customer, profile, change-password |
| `MODERATOR` | `/dashboard/moderator` | moderator, verification-queue, reports, notifications |
| `ADMIN` | `/dashboard/admin` | everything |

Source of truth: `lib/core/roles.ts` (`homeForRole`, `canAccessDashboardPath`, `roleLabel`).

### File uploads

- Uploads use `FormData` multipart requests to the API:
  - Profile photo → `POST /api/v1/profile/me/photo` (field `file`)
  - Product images → `POST/PATCH /api/v1/products` (field `images`)
  - Business documents → `POST /api/v1/businesses/:id/documents`
  - Report attachments → `POST /api/v1/reports`
- The resulting URLs are stored through the API; the client does not manage storage credentials.

### Payments

- `lib/core/bkash-api.ts` initiates and verifies bKash payments.
- `app/payment/success` and `app/payment/failed` render the result.

---

## Coding Rules

### General

- Use **TypeScript** with strict typing. Avoid `any`; prefer `unknown` plus narrowing.
- Keep code simple, readable, and junior-developer friendly. Avoid unnecessary abstraction.
- Reuse existing shared logic before writing new helpers.
- Make the smallest change required for the task. Do not refactor working code for style.
- Do not add dependencies without a clear need.

### Imports and naming

- Use the `@/` path alias (for example `@/lib/core/env`).
- Components: `PascalCase` files matching the component name.
- Hooks: `useSomething.ts` in `hooks/`.
- API modules: kebab-case with an `-api` / `-action` suffix.
- Keep domain types in `types/` when shared across features.

### React and Next.js

- Prefer server components for data fetching; add `"use client"` only when interactivity requires it.
- Keep client components small and push data fetching to the server where possible.
- Use `next/image` for remote images; allowed hosts are configured in `next.config.ts`.
- Use the existing UI primitives in `components/ui` and the `cn()` helper from `lib/utils.ts`.
- Handle **loading**, **empty**, **success**, and **error** states for every async flow.
- Never swallow API errors silently; surface a useful message and log the real error.

### API and auth

- Never hardcode API origins. Import `SERVER_URL` / `apiUrl()`.
- Always send cookies (`credentials: "include"`).
- Do not duplicate authorization logic on the client; the API is the boundary.
- Do not add OTP calls after a failed login or password check.

### Environment

- Only `NEXT_PUBLIC_SERVER_URL` is read by the client.
- Do not hardcode localhost or production URLs in components.
- `NEXT_PUBLIC_*` values are inlined at build time; restart the dev server after changing them.

### Team and branch safety

- Read [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) before editing shared code.
- Do not modify another developer's branch or feature unless it directly blocks the current task.
- If existing logic must be replaced, explain why, keep the previous logic commented with attribution, and make the smallest safe change.
- Do not run destructive Git operations. Stop and ask the user.
- Follow the docs-first workflow for auth/RBAC (`AUTH_AND_RBAC.md`) and the seller dashboard (`sellerDashboardContext.md`).

---

## Testing Commands

There is no unit or end-to-end test runner configured in `package.json`. Verify changes with:

```bash
# Start the app and test the flow manually
npm run dev

# Generate Next.js route types (required before a clean type-check)
npx next typegen

# Type-check the project
npx tsc --noEmit

# Lint
npm run lint

# Production build
npm run build

# Serve the production build
npm run start
```

### Manual test checklist

- [ ] UI works at mobile and desktop widths
- [ ] API request goes to the intended environment (local vs hosted)
- [ ] Loading, empty, success, and error states are handled
- [ ] Invalid input shows a clear message
- [ ] Browser console has no new errors
- [ ] Session cookie is sent and the user stays signed in
- [ ] Role-based redirects land on the correct dashboard
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` passes

> `npm run lint` currently reports pre-existing `@typescript-eslint/no-explicit-any` errors in `lib/**`. Do not introduce new ones.
