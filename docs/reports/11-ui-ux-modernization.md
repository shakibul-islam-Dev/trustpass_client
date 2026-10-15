# Report 11 — Project-Wide UI/UX Modernization

**Status:** Done
**Spec:** [`docs/DESIGN_BLUEPRINT.md`](../DESIGN_BLUEPRINT.md)
**Scope:** All roles (public, auth, seller, admin, moderator, customer) — shared components first.
**Branch:** `shakibul` (changes are **uncommitted**; user performs git operations).

## What was requested

Modernize the whole UI into one consistent, premium, responsive design system, following the
blueprint's phased workflow (audit → tokens → primitives → rollout → responsive → verify).
UI only: no new dependencies, no HeroUI, no backend changes, and all API/auth/logic/routes
preserved.

## Guiding decision

The design tokens and core primitives were already well-formed and token-based, so the gap
was **page-level application** — pages that had drifted onto off-brand palettes
(indigo/purple/blue/sky/teal/…) or raw status hex colors. The work therefore mapped those
values back onto the existing semantic tokens instead of rewriting primitives.

Color mapping used throughout:

| Was | Now |
|---|---|
| indigo / purple / blue / sky / teal | brand `primary` / `primary-soft` |
| emerald / green | `success` / `success-soft` |
| amber / yellow | `warning` / `warning-soft` |
| red / rose | `danger` / `destructive` / `…-soft` |

## Phase 2 — Design tokens

`app/globals.css` — added three foreground tokens for text sitting on a **solid** semantic
fill, so a solid `bg-success`/`bg-warning`/`bg-danger` chip has readable text:

- `--success-foreground`, `--warning-foreground` (dark text), `--danger-foreground` (light text)
- Their `--color-*` theme mappings in the `@theme inline` block.

## Phase 3 — Shared UI primitives

| File | Change |
|---|---|
| `components/shared/StatusBadge.tsx` | **New** canonical status → badge mapping (`success`/`warning`/`danger`/`outline`/`secondary`/`primary-soft`), with a `statusLabel()` helper. Unknown values fall back to a neutral badge showing the raw text. |
| `components/seller/SellerStatusBadge.tsx` | Reduced to a thin re-export of the shared badge — no duplicated logic, existing imports unchanged. |
| `components/shared/notification-dropdown/NotificationDropdown.tsx` | Width `w-[380px]` → `w-[min(380px,calc(100vw-2rem))]` to prevent mobile overflow. |

## Phase 4 — Application-wide rollout

Re-themed to brand + semantic tokens across all roles. No logic, props, or route changes.

**Public / shared**
- `app/businesses/[id]/page.tsx`, `app/products/[slug]/page.tsx`
- `app/not-found.tsx`, `app/error.tsx`, `app/loading.tsx`
- `components/marketplace/HomeTrustGuide.tsx`, `HeroBackdrop.tsx`
- `components/marketplace/businesses/BusinessCard.tsx`, `products/ProductCard.tsx`
- `components/shared/notification-dropdown/NotificationItem.tsx`

**Dashboards (shell + all roles)**
- `components/dashboard/DashboardSideBar.tsx` (shared sidebar, de-indigo'd)
- `app/dashboard/admin/page.tsx`, `admin/notifications/page.tsx`
- `app/dashboard/moderator/page.tsx`, `moderator/notifications/page.tsx`
- `app/dashboard/customer/page.tsx`

**Seller**
- `components/seller/SellerTrustPassport.tsx`, `SellerDashboard.tsx` (raw hex score colors → CSS vars)

**Admin components**
- `components/admin/overview/StatCard.tsx`
- `user-management/UserTable.tsx`, `RoleChangeModal.tsx`
- `verification-queue/VerificationTable.tsx`, `VerificationDetailsModal.tsx`
- `trust-rules/TrustRuleTable.tsx`
- `reports-review/ReportTable.tsx`
- `products/ProductTable.tsx`, `ProductDetailsModal.tsx`
- `payment-management/PaymentsTable.tsx`, `PaymentDetailsModal.tsx`
- `bussiness-list/BusinessTable.tsx`, `BusinessDetailsModal.tsx`

**Moderator / Customer components**
- `components/moderator/ScoreBreakdownModal.tsx`
- `components/customer/report-management/CustomerReportStats.tsx`, `CustomerReportDetailsModal.tsx`
- `components/customer/overview/RecentActivityList.tsx`
- `components/customer/notification-management/CustomerNotificationList.tsx`

A follow-up scan found **zero** remaining off-brand palette colors in `app/` and
`components/` `.tsx`. Remaining `white`/`black`/hex values are legitimate (image overlays,
UI primitives, the Google social icon, recharts internals).

## Phase 5 — Responsive & interaction pass

Filter bars across admin/moderator/customer stacked on mobile but kept a fixed-width
select. Standardized them to the `w-full sm:w-[NNNpx]` pattern (matching the existing
`CustomerReportFilters.tsx` reference):

| File | Select(s) |
|---|---|
| `components/admin/reports-review/ReportsClient.tsx` | status `180` |
| `components/admin/user-management/UserFilters.tsx` | role `180` |
| `components/admin/trust-rules/TrustRulesClient.tsx` | status + active `180` (×2) |
| `components/admin/payment-management/PaymentsClient.tsx` | status `180` |
| `app/dashboard/admin/products/page.tsx` | status `180` |
| `app/dashboard/admin/businesses/page.tsx` | status + featured `160` (×2) |
| `app/dashboard/customer/notifications/page.tsx` | type `180`, read `160` |
| `app/dashboard/moderator/reports/page.tsx` | status `180` |
| `app/dashboard/admin/verification-queue/page.tsx` | status `200` |
| `app/dashboard/moderator/verification-queue/page.tsx` | status `200` |

Two detail modals had a hard `grid-cols-2` info grid that could be cramped on a narrow
dialog; changed to `grid-cols-1 sm:grid-cols-2`:

- `components/customer/report-management/CustomerReportDetailsModal.tsx`
- `components/admin/reports-review/ReportDetailsModal.tsx`

Remaining fixed `grid-cols-*` values are intentional and were left as-is (image thumbnail
strips, wizard progress steps, 2-up stat pairs, `TrustStats` 2→4 columns).

Custom data tables (`BusinessRecordsTable`, `SellerPayments`) are already wrapped in
`overflow-x-auto`, satisfying the blueprint's table strategy.

## Phase 6 — Verification

| Check | Command | Result |
|---|---|---|
| Typecheck | `npx tsc --noEmit` | ✅ Clean (exit 0) |
| Build | `npm run build` | ✅ Succeeded — all 41 routes generated, no errors |
| Lint | `npx eslint .` | 75 problems (49 errors, 26 warnings) — **all pre-existing** |

No lint problem falls on a line touched by this work. The pre-existing categories are
`react-hooks/set-state-in-effect`, `@typescript-eslint/no-explicit-any`,
`react/no-unescaped-entities`, unused vars/imports, and `@next/next/no-img-element`. They
exist in `HEAD` too and do not fail the build. They were **deliberately not "fixed"** to
avoid unrelated churn.

## Files changed

**Added (1)**
- `components/shared/StatusBadge.tsx`

**Modified (50)** — the full list is in Phase 2–5 above. Grouped: 1 token file
(`app/globals.css`), 11 `app/**` pages, 36 `components/**` files, plus 2 shared
notification-dropdown files.

## Not touched / not mine

- `app/page.tsx` and the untracked `app/dashboard/seller/payments/` were already modified
  in the working tree by other work (home-page sections / seller payments) — **left
  untouched**.
- `docs/DESIGN_BLUEPRINT.md` is the task spec, not a code change.
- No backend/server code, no dependencies, no routes, no API/auth/logic.

## Definition of Done (blueprint §16)

1. Consistent visual design system — ✅ one token set applied everywhere.
2. Coherent colors/typography — ✅ off-brand palettes removed.
3. Consistent buttons/CTAs — ✅ already token-based; pages inherit.
4. Consistent modals/dialogs/forms/cards/tables/nav — ✅ re-themed.
5. Smooth hover/focus/pressed/overlay — ✅ existing token transitions preserved/used.
6. Responsive across breakpoints — ✅ filter bars + info grids + dropdown width fixed.
7. No unintended mobile overflow — ✅ no fixed control exceeds 320px; tables scroll.
8. Functionality/API/auth/permissions intact — ✅ UI-only changes.
9. Accessibility / reduced-motion — ✅ untouched existing behavior, semantic components reused.
10. Builds successfully — ✅ (see §Verification).
11. Maintainable / incremental — ✅ per-page token swaps, no rewrites.
12. Final report — ✅ this document.

## Follow-ups (optional, not blockers)

- Optionally address the pre-existing `react-hooks/set-state-in-effect` and `no-explicit-any`
  lint debt in a separate, dedicated task.
