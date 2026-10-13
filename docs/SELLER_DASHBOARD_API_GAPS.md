# Seller Dashboard — Missing Backend Capabilities

This document records the backend endpoints and data models the Seller Dashboard
needs but which **do not exist** in `trust-pass-server` today. It exists so the
frontend can ship real data where it is available and show honest, labelled empty
states everywhere else — never fabricated figures (see
`sellerDashboardContext.md` §10 and §14).

## 1. What the backend has today

Modules: `auth`, `user`, `business`, `category`, `product`, `document`,
`notification`, `report`, `trust`, `verification`, `admin`.

Prisma models: `User, Account, Session, Profile, Address, Business, Category,
Product, BusinessDocument, BusinessVerification, Verification, TrustScore,
TrustScoreRule, BusinessTrustScore, Notification, Report`.

**There is no `Order`, `OrderItem`, `Cart`, `Payment`, or `Transaction` model,
and no orders/analytics/payments/sales routes.** `report` is user-submitted abuse
reporting — not business reporting.

## 2. What the dashboard does with real data today

| Area | Source | Status |
| --- | --- | --- |
| My Products (list/create/edit/delete) | `GET/POST/PATCH/DELETE /api/v1/products`, `GET /api/v1/businesses/:id/products` | Real |
| Business creation / edit / documents | `/api/v1/businesses`, `/documents` | Real |
| Profile & photo | `lib/core/profile-api.ts` | Real |
| Trust score & verification | `/api/v1/trust-scores/business/:id`, business record | Real |
| Notifications (list / unread / read) | `/api/v1/notifications` | Real |
| Overview: Total Products, donut breakdown | derived from products | Real |
| Overview: Revenue, Orders, Pending Orders | — | **Missing backend** |
| Overview: Reports trend, Recent Orders, Top Selling | — | **Missing backend** |
| Orders page | — | **Missing backend** |
| Analytics: revenue/order metrics | — | **Missing backend** |
| Reports page (sales/revenue/orders) | — | **Missing backend** |
| Payments | — | **Missing backend** (page is a UI-only demo) |

## 3. Proposed endpoints

All follow the existing conventions: `auth("SELLER")`, the
`{ success, statusCode, message, data }` envelope, pagination via `?page=&limit=`,
and ownership enforced in the service layer.

### 3.1 Orders

```
GET   /api/v1/seller/orders
      query: page, limit, status, paymentStatus, search (order id | product name),
             sortBy (createdAt | total), sortDir (asc | desc), from, to
POST  /api/v1/seller/orders/:id/status   { status }   # fulfillment, only if permitted
GET   /api/v1/seller/orders/:id
```

`Order`: `id, sellerId, buyerId, status (PENDING|CONFIRMED|PROCESSING|SHIPPED|
DELIVERED|CANCELLED), paymentStatus (UNPAID|PAID|REFUNDED), currency, total,
createdAt, items[]`.

`OrderItem`: `id, orderId, productId, name, unitPrice, quantity`.

Fulfillment status and payment status must stay distinct (spec §5).

### 3.2 Seller analytics

```
GET /api/v1/seller/analytics/overview
    -> { totalRevenue, totalOrders, pendingOrders, completedOrders,
         averageOrderValue, revenueGrowthPct, comparisonPeriod }

GET /api/v1/seller/analytics/revenue?range=daily|weekly|monthly|yearly
    -> [{ period, revenue }]

GET /api/v1/seller/analytics/order-status
    -> [{ status, count }]

GET /api/v1/seller/analytics/top-products?limit=5
    -> [{ productId, name, image, unitsSold, revenue, stock }]
```

Revenue, order counts and unit totals must exclude `CANCELLED` and `REFUNDED`
orders so the Overview, Analytics and Reports stay consistent (spec §3.E, §10).

### 3.3 Reports

```
GET /api/v1/seller/reports/sales?from=&to=&format=json|csv
GET /api/v1/seller/reports/inventory
GET /api/v1/seller/reports/products
```

CSV export only if the app supports it (spec §7).

### 3.4 Payments

```
GET /api/v1/seller/payments
GET /api/v1/seller/payments/:id
```

Until this exists, `/dashboard/seller/payments` remains a clearly-labelled,
locally-simulated demo.

## 4. Frontend behaviour until these ship

- The Overview keeps the existing `components/dashboard/*` card design but shows
  `—` plus a caption for revenue/order metrics, and a labelled empty state inside
  the trend chart, recent-orders table and top-products card.
- The Orders page shows a labelled "not connected yet" state.
- No endpoint names above are called anywhere yet — they are a contract to build
  against, not a claim that the features work.
