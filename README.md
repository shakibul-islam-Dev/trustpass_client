# TrustPass Client

**TrustPass** is a digital trust and verification marketplace. Buyers discover products and businesses that have been verified with real documents, while sellers grow behind a visible trust layer — a Trust Passport, trust score, and verification status.

This repository is the **frontend**: a Next.js App Router application that talks to the separate [`trust-pass-server`](https://trust-pass-server.vercel.app) API. The client owns UI, routing, and API integration; the API owns the database, sessions, email, and the real authorization boundary.

> Team project by **shakibul**, **aritro**, and **shaheen**. Read [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) before touching shared code or another developer's feature.

---

## Features

### Authentication and account
- Two-step registration: register → emailed OTP → verify (verification also signs the user in)
- Login, logout, resend OTP, forgot password, and reset password flows
- Change password from the dashboard
- `httpOnly` session cookie issued by the API and sent automatically with `credentials: "include"`
- Profile management, profile photo upload, and appearance/theme settings

### Role-based access control
Four API roles: `CUSTOMER`, `SELLER`, `MODERATOR`, `ADMIN`.
- Role-aware dashboard shell (sidebar, breadcrumb, role label)
- Path-to-role mapping in `lib/core/roles.ts`
- Automatic redirect to the correct dashboard after login
- Client-side redirects for UX only; the API enforces the real permission boundary

### Public marketplace
- Landing page with hero, trust statistics, "How it works", and CTA sections
- Category list and category detail pages
- Business directory, explore view, and business detail pages
- Product catalog with search, filters, grid/list view, and pagination
- Product detail pages with gallery and comments

### Seller dashboard
- Overview with stat cards and Recharts analytics
- Business creation wizard with document upload and verification status
- Trust Passport and trust score breakdown
- Product create, edit, delete, and catalog management
- Payments history and listing quota
- Account, appearance, profile, and verification settings

### Admin and moderator panels
- User management (role, status, delete)
- Business, category, and product management
- Payment management
- Verification queue for business/document approvals
- Reports and reviews moderation
- Trust rules configuration
- Per-role notification management

### Payments and notifications
- bKash-backed payment initiation with success and failure result pages
- In-app notification center, unread counts, and mark-as-read actions
- Admin send-to-user and broadcast notifications

### UI and developer experience
- Tailwind CSS 4 design tokens and shadcn/ui primitives
- Light/dark theme via `next-themes`
- Animations via `motion`, toasts via `sonner`
- Responsive layouts, skeletons, and loading/error/not-found routes
- React Compiler enabled in `next.config.ts`

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 16** (App Router, `proxy.ts`, rewrites) |
| Language | **TypeScript 5** |
| UI | **React 19**, shadcn/ui, **Tailwind CSS 4** |
| Component primitives | `@base-ui/react` |
| Forms | **React Hook Form** |
| Data fetching | Native `fetch` via `lib/core/api-fetch.ts` and `lib/core/api-url.ts` |
| Charts | **Recharts** |
| Animation | **motion**, `tw-animate-css` |
| Icons | **lucide-react** |
| Theming | **next-themes** |
| Toasts | **sonner** |
| Payments | bKash API |
| Linting | **ESLint 9** (`eslint-config-next`) |

---

## Project Structure

```
trustpass-client/
├── app/          # Next.js App Router routes (public pages, auth, dashboards)
├── components/   # Feature components grouped by domain, plus components/ui
├── hooks/        # Auth, notifications, pagination, seller, mobile helpers
├── lib/          # API layer, server actions, shared core utilities
│   ├── core/     # fetch/URL/env helpers, auth, RBAC, domain APIs
│   ├── admin_api/ | admin_action/
│   ├── customer_api/ | customer_action/
│   ├── business-api/ | products-api/
│   └── seller/
├── types/        # Shared TypeScript domain types
├── docs/         # Design blueprint, reports, API gap notes
├── proxy.ts      # Next.js 16 proxy (intentionally a no-op)
└── next.config.ts
```

See [`CLAUDE.md`](./CLAUDE.md) for the full folder structure, architecture notes, coding rules, and testing commands.

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Create the environment file
cp .env.example .env.local

# 3. Start the development server
npm run dev
```

The app runs at <http://localhost:3000>.

Full instructions — environment variables, local API setup, API integration, and all run commands — are in [`SETUP.md`](./SETUP.md).

---

## Documentation

| File | Purpose |
|---|---|
| [`SETUP.md`](./SETUP.md) | Installation, environment, API integration, run commands |
| [`CLAUDE.md`](./CLAUDE.md) | Folder structure, architecture, coding rules, testing |
| [`CHANGELOG.md`](./CHANGELOG.md) | Version, features, env example, demo users, sample data |
| [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) | **Read first** — team and branch safety rules |
| [`AUTH_AND_RBAC.md`](./AUTH_AND_RBAC.md) | Login, registration, OTP, and RBAC explained |
| [`docs/DESIGN_BLUEPRINT.md`](./docs/DESIGN_BLUEPRINT.md) | Design system and UI/UX rules |
| [`sellerDashboardContext.md`](./sellerDashboardContext.md) | Seller dashboard scope |
| [`docs/reports/`](./docs/reports/) | Numbered audit and verification reports |
| [`docs/SELLER_DASHBOARD_API_GAPS.md`](./docs/SELLER_DASHBOARD_API_GAPS.md) | Known backend contract gaps |

---

## License

No open-source license is included in this repository. TrustPass is a **private team project**; all rights are reserved by the project owners. Add a `LICENSE` file before distributing or open-sourcing the code.
