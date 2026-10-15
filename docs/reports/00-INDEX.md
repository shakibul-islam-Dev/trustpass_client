# Seller Dashboard — Work Reports (Index)

**Project:** TrustPass client (`trustpass-client`)
**Branch:** `shakibul`
**Backend reviewed:** `/media/shakil/Projects/trust-pass-server` (local, branch `main`, HEAD `982b824`)
**Scope constraint:** Seller dashboard only. No payments/subscription/billing. No mock or invented data.

This folder contains one report per work stream. Each report states what was done, which
files changed, and the backend evidence used.

| # | Report | Status |
|---|---|---|
| 01 | [Dashboard Overview](01-dashboard-overview.md) | Done |
| 02 | [Digital Trust Passport](02-trust-passport.md) | Done |
| 03 | [Product Image Upload (create)](03-product-image-upload.md) | Done |
| 04 | [Business Social Links](04-business-social-links.md) | Done |
| 05 | [Bug Fixes](05-bug-fixes.md) | Done |
| 06 | [Backend Contract Verification](06-backend-contract-verification.md) | Done |
| 07 | [Backend Environment Divergence](07-backend-environment-divergence.md) | Finding (action needed) |
| 08 | [Blocked & Out of Scope](08-blocked-and-out-of-scope.md) | Documented |
| 09 | [Checks & Git State](09-checks-and-git-state.md) | Done |
| 10 | [Removal of Unsupported Seller UI](10-unsupported-ui-removal.md) | Done |
| 11 | [Project-Wide UI/UX Modernization](11-ui-ux-modernization.md) | Done |

> Report 11 is project-wide (all roles), not seller-only — see the design spec at
> [`docs/DESIGN_BLUEPRINT.md`](../DESIGN_BLUEPRINT.md).

## One-line summary

Four seller-dashboard areas were implemented against real backend contracts, three client
defects were fixed, every audit "unverified" item was resolved against the backend source,
and the remaining blocked items are documented with the exact backend reason.

## Backend note (read first)

The backend has **two divergent lines**:

- **Local** `/media/shakil/Projects/trust-pass-server` (`982b824`) — **no payments module,
  no Payment model, no free-listing rule.**
- **GitHub `origin/main`** (`6d530ce "feat:payment bkash add"`) — adds a bKash/payments
  module and a "first 5 products free" rule.

The local commit is **not** an ancestor of `6d530ce`; the two histories diverged.
All reports below are based on the **local** backend unless a report explicitly says
"GitHub/origin". See [07](07-backend-environment-divergence.md).
