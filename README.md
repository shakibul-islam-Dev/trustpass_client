# TrustPass — Client

**TrustPass** is a digital trust & verification marketplace. Buyers discover products and businesses that have been verified by real documents, while sellers grow behind a visible trust layer (Trust Passport, trust score, verification status). This repository is the **frontend** — a Next.js App Router application that talks to the separate `trust-pass-server` API.

> This is a team project (shakibul, aritro, shaheen). Read [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) before changing shared or another developer's code.

---

## Table of Contents

- [Project Scope](#project-scope)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Architecture Notes](#architecture-notes)
- [API Endpoints](#api-endpoints)
- [Folder Structure](#folder-structure)
- [Role-Based Access Control](#role-based-access-control)
- [Documentation](#documentation)
- [Scripts](#scripts)

---

## Project Scope

TrustPass solves one problem: **how does a customer know a seller is real?**

### In scope (this client)

| Area | What it covers |
|---|---|
| **Public marketplace** | Landing page, category browsing, business directory, product catalog with filters/search/pagination, product detail pages |
| **Authentication** | Register → email OTP verification → login, forgot/reset password, change password, session handled by the API |
| **Role-based dashboards** | Separate dashboards for Customer, Seller, Moderator and Admin, routed by role |
| **Seller toolkit** | Business creation wizard, document upload & verification status, product CRUD, analytics, payments, settings, Trust Passport |
| **Trust & safety** | Trust score breakdown, trust rules, verification queue, reports & reviews moderation |
| **Admin / Moderator panel** | User management, business/category/product management, payment management, notifications, reports |
| **Payments** | bKash-backed payment flow with success/failure pages |
| **Notifications** | In-app notification center, unread counts, per-role notification management |
| **Profile & account** | Profile management, profile photo, appearance/theme settings, password changes |

### Out of scope (handled elsewhere)

- **Database, sessions, emails, authorization boundary** → `trust-pass-server` (the API). Every protected endpoint is guarded by the server's own `auth()` middleware.
- **Backend logic changes** → this repo is UI + API integration only.
- **Server-rendered business rules** → the client is a consumer of the API contract; gaps are tracked in `docs/reports/`.

### Design scope

The whole app follows one design system described in [`docs/DESIGN_BLUEPRINT.md`](./docs/DESIGN_BLUEPRINT.md): Tailwind CSS 4 tokens, shadcn/ui primitives, light/dark themes, responsive from mobile to desktop, restrained premium visuals — TrustPass keeps its own identity (no copied branding).

---

## Key Features

### 🔐 Authentication & Security
- Two-step registration: `POST /auth/register` → OTP emailed → `POST /auth/verify-otp` (verification also signs the user in)
- Login, logout, forgot password and reset password flows with OTP
- Change password from the dashboard
- `httpOnly` session cookie issued by the API and carried automatically (`credentials: "include"`)
- Client-side role routing for UX; **the real permission boundary lives on the server**

### 👥 Role-Based Access Control (RBAC)
Four API roles: `CUSTOMER`, `SELLER`, `MODERATOR`, `ADMIN`
- Role-aware dashboard shell (sidebar, breadcrumb, role label)
- Path→role mapping in `lib/core/roles.ts` (e.g. `/dashboard/admin/**` is admin-only, `/dashboard/seller/**` allows seller + admin)
- Automatic redirect to the correct role home on login

### 🛍️ Marketplace
- Home page with hero, trust stats, "How it works", CTA sections
- Category listing and category detail pages
- Business directory (`/businesses`, `/businessesExplore`) and business detail pages
- Product catalog with filters, search hero, grid/list, pagination
- Product detail page (`/products/[slug]`) with gallery and comments

### 🏪 Seller Dashboard
- Overview with stat cards and analytics charts (Recharts)
- **Business creation wizard** with document upload and verification status tracking
- **Trust Passport** — a public-facing trust profile — plus a trust score breakdown
- Product management: create, edit, catalog table, product detail
- Payments history, account/appearance/profile/verification settings
- Empty states, status badges, and form feedback components

### 🛡️ Admin & Moderator Panels
- User management, business list, category management
- Product management and payment management
- **Verification queue** for business/document approvals (moderator + admin)
- **Reports & reviews** moderation
- **Trust rules** configuration
- Notification management per role

### 💳 Payments
- bKash integration (`lib/core/bkash-api.ts`)
- `/payment/success` and `/payment/failed` result pages

### 🔔 Notifications
- Notification dropdown in the navbar with unread badge
- Full notification center per role (`/dashboard/*/notifications`)
- Hooks: `useNotifications`, `useUnreadCount`, `useUnreadNotifications`

### 🎨 UI/UX
- Tailwind CSS 4 + shadcn/ui component library (~70 primitives in `components/ui`)
- Light/dark theme via `next-themes`
- Animations via `motion`, toasts via `sonner`, OTP input via `input-otp`
- Responsive layouts, skeletons, loading/error/not-found routes (`app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`)
- React Compiler enabled (`reactCompiler: true`)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 16** (App Router, `proxy.ts`, rewrites) |
| Language | **TypeScript 5** |
| UI | **React 19**, shadcn/ui + **Tailwind CSS 4** |
| State | **Zustand** |
| Forms / Validation | **React Hook Form** + **Zod** |
| Data fetching | **Axios** + custom `lib/core/api-fetch.ts` |
| Charts | **Recharts** |
| Motion | **motion**, `tw-animate-css` |
| Images / Uploads | `next-cloudinary`, `next/image` |
| Payments | bKash API |
| Theming | `next-themes` |
| Linting | ESLint 9 (`eslint-config-next`) |

---

## Getting Started

### Prerequisites
- Node.js 20+
- The TrustPass API running locally or reachable (default: `https://trust-pass-server.vercel.app`)

### 1. Install

```bash
npm install
```

### 2. Configure environment

Create a `.env.local` (see [`.env.example`](./.env.example)):

```bash
NEXT_PUBLIC_SERVER_URL=https://trust-pass-server.vercel.app
# local API: http://localhost:5000
```

This is the **only** environment variable the client reads.

### 3. Run

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint
```

---

## Architecture Notes

- **Same-origin API calls.** `next.config.ts` rewrites `/api/:path*` → `${NEXT_PUBLIC_SERVER_URL}/api/:path*`, so browser requests are first-party and the `httpOnly` session cookie sticks. Server-side code uses the absolute URL from `lib/core/env.ts`.
- **Sessions live on the API only.** The client never reads or trusts the cookie itself; it round-trips to the API (`useAuth()` → `getSession()`).
- **`proxy.ts` is intentionally a no-op.** Next.js 16 renamed `middleware` → `proxy`. Enforcement happens in two places instead:
  1. `useAuth()` + `lib/core/roles.ts` in `app/dashboard/layout.tsx` — UX redirects, not a boundary.
  2. The API's `auth()` middleware — the real boundary.
- **Server components for dashboards.** `lib/seller/server-data.ts` and `lib/core/server-api.ts` fetch data server-side; mutations go through `lib/*_action/*` server actions and `lib/core/mutations.ts`.
- **Docs-first team workflow.** Read `AUTH_AND_RBAC.md`, `sellerDashboardContext.md`, and `docs/reports/*` before touching auth, RBAC, or the seller dashboard.

---

## API Endpoints

All data flows through the TrustPass API. The base URL comes from `NEXT_PUBLIC_SERVER_URL` (see `lib/core/env.ts`), but browser calls go **same-origin** through the `/api/:path*` rewrite in `next.config.ts`, so the session cookie stays first-party. Every call uses `credentials: "include"`.

Two route families exist on the server:

- **`/api/v1/*`** — hand-written REST routes (auth, everything domain-related)
- **`/api/auth/*`** — better-auth routes (session, social sign-in, password reset/change)

### Auth & Session

| Method | Endpoint | Purpose | Caller |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Create account → OTP emailed | `lib/core/auth-api.ts` |
| POST | `/api/v1/auth/verify-otp` | Verify email **and** sign in | `lib/core/auth-api.ts` |
| POST | `/api/v1/auth/resend-otp` | Resend verification OTP | `lib/core/auth-api.ts` |
| POST | `/api/v1/auth/login` | Sign in with email + password | `lib/core/auth-api.ts` |
| POST | `/api/v1/auth/logout` | Revoke session server-side | `lib/core/session.ts` |
| GET | `/api/auth/get-session` | Read current session (httpOnly cookie) | `lib/core/session.ts`, `hooks/use-auth.ts` |
| POST | `/api/auth/sign-in/social` | Social sign-in | `lib/core/session.ts` |

### Passwords (better-auth routes)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/request-password-reset` | Start forgot-password flow (emails a code) |
| POST | `/api/auth/email-otp/request-password-reset` | Request reset OTP |
| POST | `/api/auth/email-otp/reset-password` | Set new password using the OTP |
| POST | `/api/auth/reset-password` | Set a new password using the reset token |
| POST | `/api/auth/change-password` | Change password while signed in (needs current password) |

All in `lib/core/password-api.ts`.

### Profile

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/users/me` | Current user |
| PATCH | `/api/v1/users/me` | Update name / phone / gender |
| GET | `/api/v1/profile/me` | Current profile (links) |
| PATCH | `/api/v1/profile/me` | Update profile (links) |
| POST | `/api/v1/profile/me/photo` | Upload profile photo (multipart, field `file`) |

All in `lib/core/profile-api.ts`.

### Businesses (public + seller)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/businesses` | List businesses (search/filter/pagination) |
| GET | `/api/v1/businesses/:id` | Business detail (public) |
| GET | `/api/v1/businesses/slug/:slug` | Business detail by slug |
| GET | `/api/v1/businesses/me` | The seller's own businesses |
| POST | `/api/v1/businesses` | Create a business |
| PATCH | `/api/v1/businesses/:id` | Update general details |
| PATCH | `/api/v1/businesses/:id/address` | Update the business address |
| POST | `/api/v1/businesses/:id/documents` | Upload a business document (multipart) |
| GET | `/api/v1/businesses/:id/documents` | List document statuses |
| POST | `/api/v1/businesses/:id/verify` | Submit the business for review |
| DELETE | `/api/v1/businesses/:id` | Delete a business (seller/admin) |

Callers: `lib/core/business-api.ts`, `lib/business-api/*`, `lib/seller/server-data.ts`.

### Products

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/products` | List products (`?search`, `?status`, `?categoryId`, pagination) |
| GET | `/api/v1/products/:id` | Single product |
| GET | `/api/v1/products/slug/:slug` | Product detail by slug (public page) |
| GET | `/api/v1/businesses/:id/products` | Products of one business |
| POST | `/api/v1/products` | Create a product (multipart `images` field) |
| PATCH | `/api/v1/products/:id` | Update a product (multipart) |
| DELETE | `/api/v1/products/:id` | Delete a product |

Callers: `lib/core/product-api.ts`, `lib/products-api/create-products.ts`, `lib/admin_api/get-products.ts`.

### Categories

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/categories` | List categories (public + admin filters) |
| GET | `/api/v1/categories/:id` | Category detail |
| POST | `/api/v1/categories` | Create category (admin) |
| PATCH | `/api/v1/categories/:id` | Update category (admin) |
| DELETE | `/api/v1/categories/:id` | Delete category (admin) |

Callers: `lib/categories-api.ts`, `lib/admin_api/getcategories.ts`, `lib/admin_action/categories_action.ts`.

### Trust Score & Documents

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/trust-scores/business/:id` | Trust score snapshot (**public**) |
| POST | `/api/v1/trust-scores/business/:id/recalculate` | Force recalculation (admin) |
| GET | `/api/v1/documents/:id` | Single document detail |
| PATCH | `/api/v1/documents/:id/review` | Approve / reject a document |
| DELETE | `/api/v1/documents/:id` | Remove a document (seller-owned) |
| GET | `/api/v1/trust-rules` | List trust rules (filters) |
| POST | `/api/v1/trust-rules` | Create trust rule (admin) |
| PATCH | `/api/v1/trust-rules/:id` | Update trust rule (admin) |
| DELETE | `/api/v1/trust-rules/:id` | Delete trust rule (admin) |

### Verification Queue

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/verifications` | List verification requests (moderator/admin) |
| GET | `/api/v1/verifications/:id` | Single verification request |
| PATCH | `/api/v1/verifications/:id/review` | Approve / reject a verification |

Callers: `lib/admin_api/get-verifications.ts`, `lib/admin_action/verifications_action.ts`.

### Reports & Reviews

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/reports` | List all reports (moderator/admin) |
| GET | `/api/v1/reports/:id` | Single report |
| GET | `/api/v1/reports/me` | The current user's own reports |
| POST | `/api/v1/reports` | Submit a report (optional file) |
| PATCH | `/api/v1/reports/:id/status` | Update report status (moderator/admin) |

Callers: `lib/admin_api/get-reports.ts`, `lib/customer_api/my_reports.ts`, `lib/customer_action/reports.ts`.

### Users & Admin Dashboard (admin only)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/admin/users` | List users (filters) |
| PATCH | `/api/v1/users/:id/role` | Change a user's role |
| PATCH | `/api/v1/users/:id/status` | Activate / deactivate a user |
| DELETE | `/api/v1/users/:id` | Delete a user |
| GET | `/api/v1/admin/businesses` | Admin list of businesses (filters) |
| GET | `/api/v1/admin/dashboard` | Admin dashboard stats (moderator reads `verifications` + `reports` instead) |

Callers: `lib/admin_api/get-users.ts`, `get-businesses.ts`, `get-dashboard.ts`, `get-moderator-dashboard.ts`, `lib/admin_action/users_action.ts`.

### Payments (bKash)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/payments/bkash/create` | Initiate a bKash payment |
| GET | `/api/v1/payments/:id` | Verify/fetch a single payment |
| GET | `/api/v1/payments/my-payments` | Authenticated seller's payment history |
| GET | `/api/v1/payments/quota` | Listing slot quota (`?businessId=`) |
| GET | `/api/v1/payments/admin/all` | All payments (admin/moderator) |

Callers: `lib/core/bkash-api.ts`, `lib/admin_api/get-payments.ts`.

### Notifications

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/notifications` | List my notifications (query params) |
| GET | `/api/v1/notifications/unread-count` | Unread badge count |
| PATCH | `/api/v1/notifications/:id/read` | Mark one as read |
| PATCH | `/api/v1/notifications/read-all` | Mark all as read |
| DELETE | `/api/v1/notifications/:id` | Delete one notification |
| POST | `/api/v1/notifications/admin/send` | Send to a specific user (admin) |
| POST | `/api/v1/notifications/admin/broadcast` | Broadcast to all users (admin) |

Callers: `lib/core/notification-api.ts`, `lib/customer_api/notifications.ts`, `lib/customer_action/notifications.ts`, `lib/admin_action/notifications_action.ts`.

### Image Uploads

Product/profile images go to **Cloudinary** via `next-cloudinary`'s `CldUploadWidget` (`components/shared/cloudinary/CloudinaryUpload.tsx`); the resulting URLs are then saved through the product/profile endpoints above.

> **Convention:** reads live in `lib/*_api/*` (or `lib/core/*-api.ts`), mutations live in `lib/*_action/*` server actions using `lib/core/mutations.ts`. Query strings are built with the shared `buildQuery()` helper.

---

## Folder Structure

```
trustpass-client/
├── app/                          # Next.js App Router routes
│   ├── page.tsx                  # Public home / marketplace landing
│   ├── layout.tsx                # Root layout (providers, toaster, theme)
│   ├── loading.tsx | error.tsx | not-found.tsx | global-error.tsx
│   ├── auth/                     # Login, register, forgot/reset password
│   │   └── layout.tsx
│   ├── businesses/               # Business directory + [id] detail
│   ├── businessesExplore/        # Explore view of businesses
│   ├── categories/               # Category list + [id] detail
│   ├── products/                 # Product catalog + [slug] detail
│   ├── payment/                  # success / failed result pages
│   └── dashboard/                # Authenticated area (role-routed)
│       ├── layout.tsx            # Session + role gate (UX only)
│       ├── profile/              # Shared profile management
│       ├── change-password/
│       ├── customer/             # overview, reports, notifications
│       ├── seller/               # overview, passport, products/[id],
│       │                         # analytics, payments, settings/*
│       ├── moderator/            # overview, verification-queue, reports
│       └── admin/                # users, businesses, categories, products,
│                                 # payments, reports, trust-rules, notifications
│
├── components/                   # Feature components, grouped by domain
│   ├── ui/                       # shadcn/ui primitives (design system)
│   ├── shared/                   # Navbar, Footer, toaster, badges,
│   │                             # cloudinary upload helpers
│   ├── home/                     # Landing sections (CTA, trust stats…)
│   ├── marketplace/              # Search hero, categories, trust guide
│   ├── products/                 # Card, grid, filters, gallery, pagination
│   ├── buisness/                 # Business creation / update forms
│   ├── seller/                   # Seller dashboard suite (passport,
│   │                             # wizard, catalog, analytics, settings…)
│   ├── admin/                    # Admin panel sections
│   ├── customer/                 # Customer dashboard sections
│   ├── auth/ | otp/ | password/  # Auth, OTP and password forms
│   ├── profile/ | dashboard/     # Profile + dashboard shell
│   ├── modal/ | ToggleBar/
│   └── theme-provider.tsx
│
├── lib/                          # API layer & server actions
│   ├── core/                     # Shared foundation
│   │   ├── api-fetch.ts          # Fetch wrapper (credentials: include)
│   │   ├── api-url.ts | env.ts   # Base URL / rewrite resolution
│   │   ├── auth-api.ts | session.ts | roles.ts
│   │   ├── password-api.ts | profile-api.ts | notification-api.ts
│   │   ├── business-api.ts | product-api.ts | categories-api
│   │   ├── bkash-api.ts          # Payments
│   │   ├── mutations.ts | server-api.ts | api-error.ts
│   ├── admin_api/ | admin_action/    # Admin reads + server actions
│   ├── customer_api/ | customer_action/
│   ├── business-api/ | products-api/ # Domain API modules
│   ├── seller/server-data.ts         # Server-side seller dashboard data
│   ├── sidebarData.ts                # Dashboard navigation config
│   ├── page-metadata.ts | utils.ts   # SEO metadata, `cn()` helper
│
├── hooks/                        # use-auth, useNotifications,
│                                 # usePagination, use-seller-dashboard,
│                                 # use-unread-count, use-mobile, use-tilt
├── types/                        # admin.ts, business.ts, categories.ts, customer.ts
├── docs/                         # DESIGN_BLUEPRINT.md, reports/, API gap notes
├── proxy.ts                      # Next 16 middleware (intentionally no-op)
├── next.config.ts                # Rewrites, images, React Compiler
├── AUTH_AND_RBAC.md              # Auth/RBAC walkthrough
├── PROJECT_CONTEXT.md            # Team rules — READ FIRST
├── sellerDashboardContext.md     # Seller dashboard context
└── FirstAudit.md | *Audit.md     # Audit reports
```

---

## Role-Based Access Control

| Role | Dashboard home | Accessible segments |
|---|---|---|
| `CUSTOMER` | `/dashboard/customer` | customer, profile, change-password |
| `SELLER` | `/dashboard/seller` | seller, customer*, profile, change-password |
| `MODERATOR` | `/dashboard/moderator` | moderator, verification-queue, reports |
| `ADMIN` | `/dashboard/admin` | everything |

Defined in `lib/core/roles.ts` (`homeForRole`, `canAccessDashboardPath`). Full story in [`AUTH_AND_RBAC.md`](./AUTH_AND_RBAC.md).

---

## Documentation

| File | Purpose |
|---|---|
| [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) | **Read first** — team/branch safety rules |
| [`AUTH_AND_RBAC.md`](./AUTH_AND_RBAC.md) | Login, register, OTP and RBAC explained |
| [`docs/DESIGN_BLUEPRINT.md`](./docs/DESIGN_BLUEPRINT.md) | Design system & UI/UX rules |
| [`sellerDashboardContext.md`](./sellerDashboardContext.md) | Seller dashboard scope |
| [`docs/reports/`](./docs/reports/) | Numbered audit/verification reports (00–11) |
| [`docs/SELLER_DASHBOARD_API_GAPS.md`](./docs/SELLER_DASHBOARD_API_GAPS.md) | Known backend contract gaps |
| [`FirstAudit.md`](./FirstAudit.md), [`SellerDashboardAudit.md`](./SellerDashboardAudit.md) | Codebase audits |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server on port 3000 |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

---
Test Accounts
Role
Email / Username
Password
Access & Scope
System Administrator


admin@gmail.com

12Password@$


Full platform control, verification audit, stats
Moderator


yivaco4460@calirona.com
11111111
Review queue, evidence approval/rejection

Business Seller
shajidaakterlopaa@gmail.com
12Password$$

Seller portal, doc upload, product catalog, QR

Customer / Buyer
shajidaislam34@gmail.com
Pa$$w0rd!

Public business search, trust passport view, report issue
## Related

- **API:** `trust-pass-server` — database, sessions, emails, authorization
- **Deployment:** client and server are deployed independently; set `NEXT_PUBLIC_SERVER_URL` per environment.
