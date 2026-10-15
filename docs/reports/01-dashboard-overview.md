# Report 01 — Dashboard Overview

**Status:** Done
**Audit items:** A3, A4, A5, A6, A7 (and A8 documented)

## What was the problem

The seller landing page (`components/seller/SellerDashboard.tsx`) rendered only a
"Total Products" card plus empty revenue/order cards. The data hook already fetched
businesses, products, trust score and unread notifications, but the page ignored them.

## What was done

Rebuilt the Overview to render only data the backend actually returns.

| Item | Implementation | Source |
|---|---|---|
| A3 Verification status | `SellerStatusBadge` per business | `business.verificationStatus` |
| A4 Trust score | Score meter, clamped 0–100, colour-coded | `business.trustScore` |
| A5 Profile completion | Derived % from 9 real business fields | `IBusiness` fields only |
| A6 Passport access | "Public profile" + "Trust Passport" links | route `businesses/{slug\|id}` |
| A7 Notifications | Unread count + link | `fetchUnreadCount()` |
| A8 Orders/revenue | Labelled placeholder (`—`, "Awaiting the orders API") | no orders backend |

The profile-completion % is **derived** from existing fields (name, description, logo,
cover, category, email, phone, address, socials). It does not invent any statistic.

## Files

- `components/seller/SellerDashboard.tsx` — Overview UI.
- `hooks/use-seller-dashboard.ts` — data loading + derived stats (unchanged contract, used).

## Backend evidence

- `GET /api/v1/businesses/me` → list of owned businesses (each with `verificationStatus`,
  `trustScore`).
- `GET /api/v1/businesses/:id/products` → products for status/count derivation.
- `GET /api/v1/notifications/unread-count` → unread count.

## Not done (backend-blocked)

- Revenue / orders / pending-orders metrics — the backend has **no order module or model**
  (see Report 08).
