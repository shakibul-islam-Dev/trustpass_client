# Changelog

All notable changes to the TrustPass client are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

---

## [0.1.0] - 2026-11-12

Initial documented release of the TrustPass frontend.

### Features

#### Authentication and account
- Two-step registration with emailed OTP verification
- Login, logout, resend OTP
- Forgot password and OTP-based password reset
- Change password while signed in
- Profile management and profile photo upload
- Appearance/theme settings

#### Role-based access control
- `CUSTOMER`, `SELLER`, `MODERATOR`, and `ADMIN` roles
- Role-aware dashboard shell, sidebar, and breadcrumbs
- Path-to-role mapping and post-login redirects
- Server-enforced authorization through the TrustPass API

#### Public marketplace
- Landing page with hero, trust stats, and how-it-works sections
- Category list and category detail pages
- Business directory, explore page, and business detail pages
- Product catalog with search, filters, grid/list view, and pagination
- Product detail pages with gallery and comments

#### Seller dashboard
- Overview with stat cards and Recharts analytics
- Business creation wizard and address management
- Business document upload and verification status
- Trust Passport and trust score breakdown
- Product create, edit, delete, and catalog management
- Payment history and listing quota
- Account, appearance, profile, and verification settings

#### Admin and moderator panels
- User management with role and status changes
- Business, category, and product management
- Payment management
- Verification queue for business and document review
- Reports and reviews moderation
- Trust rules configuration
- Per-role notification management

#### Payments and notifications
- bKash payment initiation
- Payment success and failure result pages
- Notification center with unread counts
- Mark one/all as read and delete notifications
- Admin send-to-user and broadcast notifications

#### UI and developer experience
- Tailwind CSS 4 design tokens and shadcn/ui primitives
- Light/dark theme with `next-themes`
- Animations with `motion` and `tw-animate-css`
- Toasts with `sonner`
- Responsive layouts, skeletons, and loading/error/not-found routes
- React Compiler enabled

### Changed
- Browser API calls use the same-origin `/api/:path*` rewrite so the API session cookie stays first-party.
- Documentation consolidated into `README.md`, `SETUP.md`, `CLAUDE.md`, and this changelog.

### Removed
- Unused packages: `axios`, `zod`, `zustand`.
- Packages used only by unreferenced files, together with those files:
  - `@shadcn/react` and `components/ui/questionnaire.tsx`
  - `input-otp` and `components/ui/input-otp.tsx`
  - `react-resizable-panels` and `components/ui/resizable.tsx`
  - `next-cloudinary` and `components/shared/cloudinary/CloudinaryUpload.tsx`

---

## Environment Variables

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_SERVER_URL=https://trust-pass-server.vercel.app
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SERVER_URL` | No | `https://trust-pass-server.vercel.app` | Base URL of the TrustPass API. Use `http://localhost:5000` for a local backend. |

`NEXT_PUBLIC_*` values are inlined at build time. Restart `npm run dev` after changing them, and set the variable in the hosting provider for production.

---

## Demo Users

The following demo/test accounts are used for local and staging verification. Do not use them in production.

### Admin

| Field | Value |
|---|---|
| Role | `ADMIN` |
| Email | `admin@gmail.com` |
| Password | `12Password@$` |
| Access | Full platform control: users, businesses, products, categories, payments, trust rules, verification queue, reports, notifications |

### Moderator

| Field | Value |
|---|---|
| Role | `MODERATOR` |
| Email | `yivaco4460@calirona.com` |
| Password | `11111111` |
| Access | Verification queue, evidence approval/rejection, reports review, notifications |

### Seller

| Field | Value |
|---|---|
| Role | `SELLER` |
| Email | `shajidaakterlopaa@gmail.com` |
| Password | `12Password$$` |
| Access | Seller dashboard, business documents, product catalog, Trust Passport, payments |

### Customer

| Field | Value |
|---|---|
| Role | `CUSTOMER` |
| Email | `shajidaislam34@gmail.com` |
| Password | `Pa$$w0rd!` |
| Access | Public business search, Trust Passport view, reports, notifications |

> Demo credentials may change or be removed from the backend database. If an account does not work, seed or create one through the API, or ask a backend maintainer.

---

## Sample Data

The client does **not** ship seed scripts or fixture files. All sample data is supplied by the `trust-pass-server` database and read through the API.

A populated environment typically contains:

| Entity | Where it appears | Notes |
|---|---|---|
| Categories | `/categories`, product filters, admin category management | Needed before products can be categorized |
| Businesses | `/businesses`, `/businessesExplore`, admin businesses | Owned by seller accounts, with verification status |
| Business documents | Seller verification, moderator/admin verification queue | Trade license, NID/TIN, and other uploaded evidence |
| Products | `/products`, business detail, seller/admin product pages | Linked to a business and category; may have images |
| Trust scores | Business detail, seller Trust Passport | Public endpoint; reflects verified documents and rules |
| Trust rules | `/dashboard/admin/trust-rules` | Weighting rules used to compute trust scores |
| Payments | Seller payments, admin payments | bKash payment records and listing quota |
| Reports | Customer reports, moderator/admin reports review | User-submitted issues with optional attachments |
| Notifications | Navbar dropdown and per-role notification pages | Per-user and broadcast messages |

### Resetting or refreshing sample data

1. Ensure the API is running and `NEXT_PUBLIC_SERVER_URL` points at it.
2. Create data through the UI or the API:
   - Register a seller, then create a business in `/dashboard/seller`.
   - Upload documents and submit the business for verification.
   - Add products from `/dashboard/seller/products`.
   - Sign in as moderator/admin to approve verification and review reports.
3. If you need a clean database, reset it on the **server** project. The client has no database or seed access.
