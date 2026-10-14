# Report 10 — Removal of Unsupported Seller UI

**Status:** Done
**Scope:** Seller dashboard only. Payments handed to another developer; kept out of client scope.

## What was requested

Remove the seller-dashboard UI that has **no backend support** (orders, order/revenue widgets,
etc.), and remove the seller payments UI (owned by another developer).

## Decision

Kept the **Analytics** page — it is **not** a placeholder. It is computed live from
`getMyBusinesses()` + `getBusinessProducts()` (business/product counts, published/draft/
out-of-stock, inventory value, average trust, category breakdown). No mocked values.
Removed everything that was genuinely unbacked.

## Removed — no backend support (placeholders)

| Removed | Reason |
|---|---|
| `components/seller/SellerOrders.tsx` | "Coming soon" placeholder — no orders API |
| `app/dashboard/seller/orders/page.tsx` | Route for the above |
| `components/dashboard/RecentOrders.tsx` | Order table — no orders API |
| `components/dashboard/ReportsChart.tsx` | Revenue/sales trend — no sales API |
| `components/dashboard/TopSellingProducts.tsx` | Best-sellers by sales — no orders API |

Removed from `components/seller/SellerDashboard.tsx`:
- Stat cards **Total Revenue**, **Total Orders**, **Pending Orders** (all showed `—`).
- The **Reports** (Revenue) chart, **Recent Orders** table, **Top-Selling Products** panel.
- Replaced the four placeholder stat cards with three **real** cards: Businesses,
  Total Products, Unread Notifications.

Kept on the Overview (real data): verification/trust/profile-completion, the **Catalog
status** donut (`AnalyticsChart`, real product-status segments), unread notifications, and
the Trust Passport card.

## Removed — seller Payments UI (owned by another developer)

| Removed | Reason |
|---|---|
| `components/seller/SellerPaymentCenter.tsx` | Simulated demo — no payment backend |
| `app/dashboard/seller/payments/page.tsx` | Seller payment page (demo) |
| `app/dashboard/seller/payments/result/page.tsx` | Demo result page |

Also removed the **Orders** and **Payments** entries from the seller sidebar
(`lib/sidebarData.ts`) and the **Payments** card from `SellerSettingsHub.tsx`.

> `CreditCard` is still imported in `lib/sidebarData.ts` because the **Admin** sidebar
> uses it (`/dashboard/admin/payments` — left untouched, not seller scope).

## Resulting seller navigation

Dashboard · Trust Passport · Analytics · My Products · My Reports · Notifications ·
Settings · Verification

## Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ Clean (after regenerating `.next` route types via build) |
| `npx eslint` on changed files | ✅ Clean |
| `npm run build` | ✅ Succeeded; `/dashboard/seller/orders` and `/dashboard/seller/payments` no longer in the route table |
| Dangling references to removed modules | ✅ None (`grep` clean) |

## Not touched

- Payments **admin** pages, and the payments backend (another developer's scope).
- The Analytics page (kept — real data).
- No backend changes.
