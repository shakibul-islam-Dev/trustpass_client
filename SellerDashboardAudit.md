# TrustPass Seller Dashboard — BRD Compliance Audit

> Audit scope: seller-facing dashboard (`/dashboard/seller/*`), the shared business/profile/verification components it reuses, the API client layer under `lib/`, the public business page, and the client navigation/RBAC. Backend source (`trust-pass-server`) is **not present in this workspace**, so server-side behaviour is marked UNVERIFIED where it could not be inspected. Evidence is limited to files that exist in this repository.
>
> Branch: `shakibul` · Pre-existing local changes present in `components/buisness/BusinessCreationForm.tsx` and `components/seller/BusinessCreationWizard.tsx` (user work, left untouched) · `FirstAudit.md` untracked.

---

## Part 1: Executive Summary

The Seller Dashboard is a **substantial, mostly-functional UI with a genuinely integrated core** (businesses, products, verification documents, profile, notifications), sitting **on top of a backend that has no orders, sales, payments, analytics, or subscription model.** The frontend is honest about this: instead of inventing numbers it renders labelled `—` placeholders and "Coming soon" states, which is good engineering discipline but leaves several BRD requirements unmet.

**Requirements audited: 49** (A–G, expanded from the brief).

| Status | Count |
|---|---|
| COMPLETE | 21 |
| PARTIAL | 15 |
| MISSING | 10 |
| UNVERIFIED | 3 |
| BROKEN | 0 |

**Most important functional gaps**

1. **Dashboard Overview is largely incomplete (Module A).** The landing page (`components/seller/SellerDashboard.tsx`) shows only *Total Products*. Business verification status, trust score, profile-completion, Trust Passport preview and pending-task/notification widgets are absent, even though the data hook already fetches `averageTrustScore`, `businesses`, and `unreadNotifications` (`hooks/use-seller-dashboard.ts`) and simply isn't rendered.
2. **No Digital Trust Passport (Module E).** No seller-side preview, no share/URL affordance, and the public product catalogue (`app/products`, `app/products/[slug]`) reads **static JSON** (`public/data/productDetails.json`, `businessCard.json`), not the backend.
3. **Freemium listing rule (first two listings free) is not implemented anywhere (D8).** No subscription, plans, billing, or listing-limit code exists.
4. **Orders / Analytics / Payments / Reports have no backend** (`docs/SELLER_DASHBOARD_API_GAPS.md`); Orders is a "Coming soon" page, Payments is a clearly-labelled local simulation.
5. **Two real product-management gaps:** the create modal has **no image upload** (images only in edit), and ownership/privacy enforcement lives server-side and could not be verified here.

---

## Part 2: Feature-by-Feature Compliance Matrix

| ID | Module | Requirement | Status | Evidence | Remaining Work |
|---|---|---|---|---|---|
| A1 | Overview | Seller dashboard landing page | COMPLETE | `app/dashboard/seller/page.tsx` → `components/seller/SellerDashboard.tsx` | — |
| A2 | Overview | Total product count | COMPLETE | `SellerDashboard.tsx` stat `products` from `useSellerDashboardData()` (`hooks/use-seller-dashboard.ts`) via `GET /api/v1/businesses/:id/products` | — |
| A3 | Overview | Business verification status | MISSING | Overview renders no verification status; hook loads `businesses` but `SellerDashboard.tsx` ignores it. Status only appears in Analytics/Verification | Add a verification-status card to Overview |
| A4 | Overview | Current trust score | MISSING | Hook computes `stats.averageTrustScore` but `SellerDashboard.tsx` never renders it; only `SellerAnalytics.tsx` shows "Average trust" | Surface trust score on Overview |
| A5 | Overview | Business profile completion status | MISSING | No completion calculation anywhere (grep for completion logic returns nothing) | Define + compute profile completeness |
| A6 | Overview | Trust Passport status/preview access | MISSING | No passport component, link or preview in the dashboard | Build passport preview entry point |
| A7 | Overview | Pending tasks / verification actions / notifications | PARTIAL | Hook fetches `unreadNotifications` (`fetchUnreadCount`) but Overview never displays it; a Notifications page exists (`app/dashboard/customer/notifications/page.tsx`) | Add pending-tasks/verification-action widget + unread badge on Overview |
| A8 | Overview | Data from real APIs, not hardcoded | PARTIAL | Products/business real; revenue, orders, pending-orders rendered as `—` placeholders (`pendingStat`, `PENDING = "Awaiting the orders API"`) | Implement orders/analytics backend, then wire real metrics |
| B1 | Business Profile | View existing business info | COMPLETE | `components/buisness/BuisnessUpdateForm.tsx` loads via `getBusinessById` (`lib/core/business-api.ts`) | — |
| B2 | Business Profile | Update name, logo, description, category | COMPLETE | `BuisnessUpdateForm.tsx` → `updateBusiness()` (`PATCH /api/v1/businesses/:id`, multipart `logo`/`cover`) | — |
| B3 | Business Profile | Manage contact information | COMPLETE | `contactEmail`/`contactPhone` + `updateBusinessAddress()` (`PATCH /api/v1/businesses/:id/address`) | — |
| B4 | Business Profile | Manage Facebook/Instagram/other social links | PARTIAL | `UpdateBusinessPayload` supports `websiteUrl`, `instaUrl`, `tiktokUrl` — **no Facebook**. Wizard draft has unused `facebokUrl` field (`BusinessCreationWizard.tsx:27`) | Add Facebook field end-to-end or drop the dead field |
| B5 | Business Profile | Save changes through backend API | COMPLETE | `lib/core/business-api.ts` `updateBusiness`/`updateBusinessAddress` | — |
| B6 | Business Profile | Loading/success/validation/error states | COMPLETE | `BuisnessUpdateForm.tsx` skeleton, `message` tone success/error, `validateAddress()`, name validation | — |
| B7 | Business Profile | Sellers manage only their own profiles | UNVERIFIED | Edit page accepts any `?id=` (`app/dashboard/seller/settings/buisnessform/page.tsx`) and calls `PATCH` without a client ownership check; enforcement is server-side (not present to inspect) | Confirm server ownership check on `PATCH /api/v1/businesses/:id` |
| C1 | Verification | View current verification status | COMPLETE | `components/seller/SellerBusinessVerification.tsx` renders `business.verificationStatus` | — |
| C2 | Verification | Submit business info + supporting docs | COMPLETE | `components/buisness/BusinessCreationForm.tsx` → `createBusiness` + `uploadBusinessDocument`; `submitBusinessVerification` | — |
| C3 | Verification | Upload documents via backend | COMPLETE | `uploadBusinessDocument()` → `POST /api/v1/businesses/:id/documents` (multipart) | — |
| C4 | Verification | Track pending/approved/rejected requests | PARTIAL | Per-document statuses and business status shown; no verification **request history** (only latest state), though `BusinessVerificationRecord` defines `PENDING/UNDER_REVIEW/...` | Add request history/timeline if backend exposes it |
| C5 | Verification | Display rejection reasons | PARTIAL | Document-level `doc.rejectionReason` shown (`SellerBusinessVerification.tsx:499`); business-level `adminNote` in `BusinessVerificationRecord` is **not** rendered | Surface business-level rejection reason |
| C6 | Verification | Document correction & resubmission | COMPLETE | Delete non-approved doc (`deleteBusinessDocument`) + re-upload + resubmit; approved docs locked | — |
| C7 | Verification | Docs remain private, not public | UNVERIFIED | Verification page links straight to `doc.fileUrl` (Cloudinary URL) in an anchor; `GET /businesses/:id/documents` is owner-scoped per client comments, but Cloudinary access control can't be inspected | Verify Cloudinary/back-end document ACLs |
| C8 | Verification | Only moderators/admins approve/reject | UNVERIFIED | Seller UI has no approve/reject; admin/moderator queues exist in `lib/sidebarData.ts`, but server `auth()` enforcement isn't in this workspace | Confirm `auth("ADMIN"|"MODERATOR")` on review endpoints |
| C9 | Verification | Frontend status reflects backend | PARTIAL | Statuses load from API; submit does an optimistic local set to `PENDING` (`SellerBusinessVerification.tsx:260`) rather than re-fetching | Re-fetch business after submit |
| D1 | Product Mgmt | View seller's product list | COMPLETE | `SellerProductCatalog.tsx` → `SellerProductManagement.tsx` via `getBusinessProducts` | — |
| D2 | Product Mgmt | Add new products | COMPLETE | `SellerProductManagement.tsx` `saveDraft()` → `createProduct` (`POST /api/v1/products`) | — |
| D3 | Product Mgmt | Edit existing products | COMPLETE | `ProductUpdateComponent.tsx` → `updateProduct` (`PATCH /api/v1/products/:id`, multipart) | — |
| D4 | Product Mgmt | Delete products | COMPLETE | `deleteProduct` (`DELETE /api/v1/products/:id`) from list + detail | — |
| D5 | Product Mgmt | Manage names/images/prices/descriptions | PARTIAL | Create modal (`SellerProductManagement.tsx:357-408`) has name/category/price/stock/description but **no image field**; images only in edit (`ProductUpdateComponent.tsx`) | Add image upload to the create flow |
| D6 | Product Mgmt | Listing counts & statuses | COMPLETE | `SellerProductCatalog.tsx` stat cards (Total/Published/Drafts/Out of stock); status badges incl. "Out of stock" | — |
| D7 | Product Mgmt | Products belong to seller's business | PARTIAL | Catalog scopes to `getMyBusinesses()`; create passes that `businessId`. Server-side ownership not inspectable | Confirm server ties products to owning business |
| D8 | Product Mgmt | First two listings free / restrictions | MISSING | No free-listing, limit, subscription, plan or billing logic anywhere (grep: no matches in `lib`/`components`) | Implement listing-limit rule (needs backend support) |
| D9 | Product Mgmt | Ops use real APIs and persist | COMPLETE | All four CRUD calls real; errors surfaced via `actionError` | — |
| E1 | Trust Passport | Preview seller's public Passport | MISSING | No passport preview component/page in the dashboard | Build preview |
| E2 | Trust Passport | Display appropriate public business info | PARTIAL | `app/businesses/[id]/page.tsx` renders public business info from `getBusinessById`/`getBusinessBySlug`, but is a separate directory page, not a dashboard passport | Add passport page reusing this data |
| E3 | Trust Passport | Display verification status + trust score | PARTIAL | Public page shows status badge + trust-score meter (`trustScore`); no passport-specific surfacing | Fold into passport |
| E4 | Trust Passport | Display public product catalogue | MISSING | `app/products/page.tsx` + `app/products/[slug]/page.tsx` read static JSON (`public/data/productDetails.json`, `businessCard.json`); `/businesses/[id]` has no product list | Connect public catalogue to backend `GET /businesses/:id/products` |
| E5 | Trust Passport | Working public URL / sharing | PARTIAL | `/businesses/[id]` is a real public URL, but no share control or passport URL from the dashboard | Add share affordance |
| E6 | Trust Passport | Private/internal data not exposed publicly | PARTIAL | Public business page exposes only name/description/address/contact/score/status — no documents; document-URL privacy depends on Cloudinary (see C7) | Verify document ACLs; keep docs out of public payloads |
| E7 | Trust Passport | Public status/score from authoritative backend | PARTIAL | Public page uses real `getBusinessById`; however there is no "passport" surface and product catalogue is static | Consolidate on backend-sourced passport |
| F1 | Account | View/update supported account info | COMPLETE | `components/profile/ProfileManagement.tsx` → `getMe`/`updateMe` + `getMyProfile`/`updateMyProfile` (`lib/core/profile-api.ts`) | — |
| F2 | Account | Manage password/security | COMPLETE | Inline change + `/dashboard/change-password`; `changePassword` (`lib/core/password-api.ts`) | — |
| F3 | Account | Notification preferences | PARTIAL | `components/seller/SellerAccountSettings.tsx` toggles are local `useState` only; explicitly "Saved on this device only until a preferences API is available" | Add a preferences API + persistence |
| F4 | Account | Log out correctly | COMPLETE | `signOut()` → `POST /api/v1/auth/logout` (`lib/core/session.ts`); used in layout + settings | — |
| F5 | Account | Uses existing auth architecture | COMPLETE | httpOnly cookie session; `useAuth()` (`hooks/use-auth.ts`) → `getSession()`; role gate in `app/dashboard/layout.tsx` | — |
| G1 | Plans/Billing | Seller subscription/billing pages | MISSING | None exist; sidebar has only "Payments" (`lib/sidebarData.ts`) | Add plans/billing pages (needs backend) |
| G2 | Plans/Billing | Pricing plans & listing limits | MISSING | No plan/limit logic anywhere | Define + implement (needs backend) |
| G3 | Plans/Billing | Backend integration | MISSING | `docs/SELLER_DASHBOARD_API_GAPS.md` §3.4: no payment endpoint; no subscription models | Build endpoints/models |
| G4 | Plans/Billing | Identify placeholder/non-functional flows | PARTIAL | `app/dashboard/seller/payments/page.tsx` `handlePay` is a `setTimeout` simulation with hardcoded `৳500`, labelled "Demo only" | Replace when a provider/payment API exists |

---

## Part 3: Real API Integration Audit

All browser calls go through the same-origin `/api/*` rewrite (`next.config.ts`) to the API server, with `credentials: "include"`.

### Confirmed integrated

| Integration | Client function | Endpoint |
|---|---|---|
| My businesses | `getMyBusinesses` | `GET /api/v1/businesses/me` |
| Business by id (public) | `getBusinessById` | `GET /api/v1/businesses/:id` |
| Create business | `createBusiness` | `POST /api/v1/businesses` |
| Update business | `updateBusiness` | `PATCH /api/v1/businesses/:id` (multipart `logo`/`cover`) |
| Update address | `updateBusinessAddress` | `PATCH /api/v1/businesses/:id/address` |
| Upload doc | `uploadBusinessDocument` | `POST /api/v1/businesses/:id/documents` |
| List docs | `getBusinessDocuments` | `GET /api/v1/businesses/:id/documents` |
| Delete doc | `deleteBusinessDocument` | `DELETE /api/v1/documents/:id` |
| Submit verification | `submitBusinessVerification` | `POST /api/v1/businesses/:id/verify` |
| Products | `getProduct`, `getBusinessProducts`, `createProduct`, `updateProduct`, `deleteProduct` | `GET/POST/PATCH/DELETE /api/v1/products`, `GET /api/v1/businesses/:id/products` |
| Categories | `getCategories` | `GET /api/v1/categories` (`lib/categories-api.ts`) |
| Profile | `getMe/updateMe`, `getMyProfile/updateMyProfile`, `uploadProfilePhoto` | `/api/v1/users/me`, `/api/v1/profile/me`, `/api/v1/profile/me/photo` |
| Session/sign-out | `getSession`, `signOut` | `GET /api/auth/get-session`, `POST /api/v1/auth/logout` |
| Notifications | `fetchMyNotifications`, `fetchUnreadCount`, mark/delete | `/api/v1/notifications`, `/notifications/unread-count`, `/notifications/:id/read`, `/notifications/read-all` |

**Evidence:** `lib/core/business-api.ts`, `lib/core/product-api.ts`, `lib/core/profile-api.ts`, `lib/core/session.ts`, `lib/categories-api.ts`, `lib/customer_api/notifications.ts`, `lib/customer_action/notifications.ts`. **Limitation:** integration is proven at the client layer; response shape/behaviour depends on the server, which is not in this workspace.

### Partially integrated

- **Product create** — `createProduct` is real but sends no images (create modal has none); image management exists only in `updateProduct`.
- **Trust score history** — `getTrustScoreHistory` (`GET /api/v1/trust-scores/business/:id`) is defined in `lib/core/business-api.ts` but never consumed by the seller UI; trust score is read from `business.trustScore` on business records. (Defined, unused.)
- **Verification submit** — real call, followed by an optimistic local status update rather than a re-fetch.

### Mocked or hardcoded

- **Payments checkout** — `app/dashboard/seller/payments/page.tsx`: `setTimeout(900)`, generated reference, hardcoded `৳500`; labelled "Demo only". `SellerPaymentCenter.tsx` renders it.
- **Public product catalogue** — `app/products/page.tsx` and `app/products/[slug]/page.tsx` import `public/data/productDetails.json` and `businessCard.json`.
- **Overview order/revenue metrics** — deliberately `—` with captions (`SellerDashboard.tsx`), not fabricated.
- **Notification preferences** — local component state only (`SellerAccountSettings.tsx`).
- **Orphan (defined, unused) components** — `TrustScoreBreakdown.tsx`, `BusinessRecordsTable.tsx`, `BusinessDocumentStatuses.tsx`, `SellerFormFeedback.tsx`; legacy `lib/products-api/create-products.ts` (`handleCreateProduct`, `getProductsForBusiness`).

### Missing

- Orders, sales, seller analytics, business reports, payments/transactions, subscriptions/plans, listing limits — none exist as endpoints or models (`docs/SELLER_DASHBOARD_API_GAPS.md` §2–3.4). The proposed contracts in that doc are **not called anywhere**.

### Unable to verify

- Server-side ownership on business/product/verification mutations; moderator/admin-only approval; Cloudinary document access control. Backend source unavailable.

---

## Part 4: Security and Permissions

**Confirmed (client-observable) observations**

- **Session design is sound.** No token in `localStorage`; the session cookie is httpOnly (`lib/core/session.ts`, `hooks/use-auth.ts`). Same-origin `/api/*` rewrite (`next.config.ts`) keeps the cookie first-party — a deliberate fix for third-party-cookie blocking (`AUTH_AND_RBAC.md` §11.2). `proxy.ts` is an intentional no-op; the real boundary is the server's `auth()` middleware (`AUTH_AND_RBAC.md` §7).
- **Role gating is UX-only and appropriately documented.** `app/dashboard/layout.tsx` + `lib/core/roles.ts` gate subtrees; the file comments state this is UX, not security. Seller "Reports"/"Notifications" reuse `/dashboard/customer/*`, permitted because `SEGMENT_ROLES.customer` includes all roles (`roles.ts:27`).

**Potential risks requiring further testing (not confirmed vulnerabilities)**

1. **Verification document exposure.** `SellerBusinessVerification.tsx` renders `doc.fileUrl` directly in `<a target="_blank">`. If Cloudinary assets are public-URL-accessible, any leaked URL exposes a seller's NID/trade licence. Privacy depends entirely on Cloudinary/back-end config → UNVERIFIED. *(BRD C7, E6.)*
2. **Business edit by id.** `/dashboard/seller/settings/buisnessform?id=<id>` loads and `PATCH`es any id with no client-side ownership check. If the server does not enforce ownership, this is an IDOR. Server not inspectable → UNVERIFIED. *(BRD B7.)*
3. **Trust score / verification status manipulation.** Nothing on the client writes `trustScore` or `verificationStatus` (read-only; statuses only change via `POST .../verify`). No client-side manipulation path found. Server enforcement UNVERIFIED. *(BRD C8.)*
4. **Public Passport data.** `app/businesses/[id]/page.tsx` exposes only public fields (name, description, address, contact, type, trust score, status) — no documents or moderation notes observed. The larger leak risk is the static marketplace, not this page.

No confirmed vulnerability was reproduced in this audit (browser/runtime and server source were out of scope).

---

## Part 5: UI and UX Gaps

- **Overview is under-built vs. its own data.** `use-seller-dashboard.ts` supplies `averageTrustScore`, `businesses` and `unreadNotifications`, but `SellerDashboard.tsx` renders only the product count plus empty revenue/order cards. Verification status, trust score, profile completion, passport preview and pending tasks are all missing from the landing page.
- **Product create vs. edit mismatch.** Create modal (`SellerProductManagement.tsx`) has no image upload; images are editable only in `ProductUpdateComponent.tsx`. Users cannot attach images when creating a product.
- **Orders page is a placeholder** (`SellerOrders.tsx`, badge "Coming soon") despite being a primary sidebar item.
- **Payments is a simulation** with a hardcoded amount and a generated reference; the success page is driven by URL params (`payments/result/page.tsx`).
- **Notification preferences are non-persistent** and visibly labelled as such — but still present as toggles, which can mislead.
- **Seller "My Reports" is customer abuse-reporting**, not seller business/sales reports (`app/dashboard/customer/reports/page.tsx`; submit button is commented out).
- **Dead/orphan components** (`TrustScoreBreakdown`, `BusinessRecordsTable`, `BusinessDocumentStatuses`, `SellerFormFeedback`) and unused API (`lib/products-api/create-products.ts`) add confusion.
- **Wizard dead field** `facebokUrl` (`BusinessCreationWizard.tsx:27`) is declared but never used or sent.
- **Public catalogue disconnected** from backend products (static JSON), so a seller's real products never reach the public product pages.
- **Optimistic verification status** may briefly disagree with the backend until reload.

---

## Part 6: Prioritized Remaining Work

### P0 — Critical (security / data integrity)
1. **Verify ownership enforcement on business/product/verification mutations server-side** (`PATCH /api/v1/businesses/:id`, products, documents). Client accepts ids from the URL; only the server can prevent IDOR. *Relevant:* `BuisnessUpdateForm.tsx`, `lib/core/business-api.ts`, server `auth()`.
2. **Lock down verification document access.** Stop relying on a public Cloudinary `fileUrl` in an anchor; use signed/expiring URLs or a proxied, authenticated download. *Relevant:* `SellerBusinessVerification.tsx` (`doc.fileUrl`), `business-api.ts`.
3. **Confirm moderator/admin-only approval** on review endpoints so a seller cannot self-approve. *Relevant:* server verification routes; seller passes only `POST .../verify`.

### P1 — High (core missing/broken functionality)
4. **Complete the Dashboard Overview (Module A).** Add cards/widgets for verification status, trust score, profile-completion, passport preview, and pending tasks/unread notifications — the data is already fetched. *Relevant:* `SellerDashboard.tsx`, `hooks/use-seller-dashboard.ts`.
5. **Build the Digital Trust Passport (Module E).** Seller preview + shareable public URL; render backend-sourced status/score. *Relevant:* new seller component; reuse `app/businesses/[id]/page.tsx`.
6. **Connect the public product catalogue to the backend** and show a business's products on its public page. *Relevant:* `app/products/page.tsx`, `app/products/[slug]/page.tsx`, `public/data/*.json`, `GET /api/v1/businesses/:id/products`.
7. **Implement orders/sales** (backend + Orders page) so Overview revenue/order metrics become real. *Relevant:* `SellerOrders.tsx`, `docs/SELLER_DASHBOARD_API_GAPS.md` §3.1.

### P2 — Medium (incomplete integrations / UX)
8. **Add image upload to the product create flow.** *Relevant:* `SellerProductManagement.tsx` create dialog.
9. **Surface business-level rejection reason** (`adminNote`) and re-fetch status after submit. *Relevant:* `SellerBusinessVerification.tsx`.
10. **Persist notification preferences** (API) rather than device-local toggles. *Relevant:* `SellerAccountSettings.tsx`.
11. **Add Facebook** to business social links, or remove the dead `facebokUrl` draft field. *Relevant:* `business-api.ts`, `BusinessCreationWizard.tsx`.
12. **Add a real seller Reports capability** (or relabel) instead of reuse of customer abuse reporting. *Relevant:* `lib/sidebarData.ts`, `app/dashboard/customer/reports/page.tsx`.

### P3 — Low (polish / hygiene)
13. **Remove or wire up orphan components and legacy API** (`TrustScoreBreakdown`, `BusinessRecordsTable`, `BusinessDocumentStatuses`, `SellerFormFeedback`; `lib/products-api/create-products.ts`; `getTrustScoreHistory`).
14. **Add profile-completion and passport-affordance polish** and consistent empty states on Overview.

---

## Part 7: Final Verdict

1. **Is the Seller Dashboard ready for production?**
   **No.** The core business/product/verification/profile flows are integrated and usable, but the dashboard Overview is incomplete, there is no Trust Passport, no orders/analytics/payments, and no freemium/listing rules. With no Orders/Cart/Payment models on the backend, several BRD modules cannot function at all. Security-critical server enforcement (ownership, doc privacy, approval rights) is unverified.

2. **Which features are fully functional?**
   Business profile view/update (name, logo, cover, description, category, contact, address, Instagram/TikTok/website), product list/create/edit/delete (minus create-time images), document upload/delete and verification submission, rejection reasons at document level, profile + password management, sign-out, and notifications list/unread/mark/delete. All of these are wired to real endpoints and expose loading/success/error states.

3. **Which features only have a UI implementation?**
   Payments (simulated checkout, hardcoded amount, generated reference), notification preferences (component state only), Orders page ("Coming soon"), the Overview's revenue/orders/pending cards (`—` placeholders), and the public product catalogue (static JSON). Orphan components (`TrustScoreBreakdown` etc.) are UI-only and unused.

4. **Which features are connected to real backend APIs?**
   Businesses (create/read/update/address), business documents (upload/list/delete), verification submit, trust score as a business field, products (full CRUD), categories, user/profile/photo, session/sign-out, and notifications. See Part 3 for endpoints and evidence.

5. **Which features are missing or broken?**
   **Missing:** Overview verification status/trust score/profile completion/passport preview/pending tasks (A3–A7), free-listing rule and limits (D8), Trust Passport preview + public catalogue (E1, E4), subscriptions/plans/billing and their backend (G1–G3). **Broken:** none reproduced (0 BROKEN). **Unverified:** ownership enforcement (B7), document privacy (C7), moderator-only approval (C8), product-business ownership (D7).

6. **What are the next five most important tasks?**
   1. Verify server-side ownership + moderator-only approval, and secure document URLs (P0).
   2. Complete the Dashboard Overview with already-fetched verification/trust/notification data (P1).
   3. Build the Trust Passport preview + shareable URL and connect the public catalogue to the backend (P1).
   4. Implement orders/sales backend and the Orders page so Overview metrics are real (P1).
   5. Add image upload to product creation (P2) — close the biggest within-reach functional gap.

7. **Which conclusions still require runtime or backend verification?**
   - Server ownership checks on business/product/document mutations (IDOR risk).
   - Cloudinary/back-end confidentiality of uploaded verification documents.
   - `auth("MODERATOR"|"ADMIN")` enforcement on approve/reject endpoints.
   - Whether products are strictly bound to the creating business server-side.
   - Real response shapes/status codes for every integration in Part 3 (backend source absent).
   - That the `/api/*` rewrite and cookie session behave correctly in production browsers (documented in `AUTH_AND_RBAC.md`, not re-tested here).

---

**Audit rules honoured:** no production code modified, created, deleted or refactored; branch unchanged; no packages installed; no migrations or destructive commands; no secrets or private user data included. Backend limits are stated explicitly and nothing was marked COMPLETE on appearance alone.
