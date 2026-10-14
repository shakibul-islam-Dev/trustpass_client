# Report 06 — Backend Contract Verification

**Status:** Done
**Purpose:** Resolve every audit item previously marked "UNVERIFIED" using the backend source.

Backend: `/media/shakil/Projects/trust-pass-server` (local, `982b824`).

| Audit item | Was | Now confirmed |
|---|---|---|
| B7 — business update ownership | UNVERIFIED | **Enforced.** `business.service` checks `ownerId` on update/delete/address. |
| C8 — moderator/admin-only approval | UNVERIFIED | **Enforced.** Route `auth("MODERATOR","ADMIN")` + "already finalised" guard in `reviewBusinessVerification`. |
| D7 — product↔business ownership | UNVERIFIED | **Enforced.** `assertBusinessOwnership` in `product.service` on create/update/delete. |
| C7 — document read access | UNVERIFIED | **Owner-or-privileged.** `document.service` `assertAccess` allows owner or ADMIN/MODERATOR. |
| C9 — status reflects backend | PARTIAL | **Correct as-is.** Submit sets `verificationStatus = PENDING` in the same transaction, so the client's optimistic update is accurate. |
| D2/D10 — product create multipart | assumed | **Confirmed.** `POST /products` uses multer `images` array (max 10, 5 MB). |
| Product validation contract | — | `businessId` uuid required; `categoryId` uuid optional; `name` 2–255; `price` ≥0; `currency` enum default BDT; `stock` int ≥0; `status` enum default ACTIVE. |
| Business create contract | — | `categoryId` uuid **required**; `businessType` enum default INDIVIDUAL; website/insta/tiktok url; email/phone optional. |
| Division / business type enums | — | Client values match server exactly (`CHITTAGONG`, not `CHATTOGRAM`, etc.). |
| Wizard category field | — | Holds the category **id** (validated against `category.id`), mapped to `categoryId` — correct. |
| Create-wizard email/phone | — | Both are required in step 0, so no empty-string validation failure. |
| Public business payload | — | Includes public fields only; **no documents** in the select. |

## Additional backend facts discovered

- **Trust score:** `GET /api/v1/trust-scores/business/:id` is **public** and returns
  `TrustScore` snapshot rows. However, `TrustScore.breakdown` only ever stores the **first**
  awarded rule (later awards update `score` only), and the labeled ledger endpoint
  `getBusinessTrustScores` is **not routed**. → a reliable rule-level breakdown is not
  available on any seller-accessible endpoint.
- **Business-level rejection reason (`adminNote`)** and verification history are only exposed
  via `/verifications`, which is `MODERATOR/ADMIN` **only** → not available to sellers.
- **Notifications:** list / unread-count / read-all / read-one / delete exist; there is **no
  preferences endpoint**.
- **Document storage:** uploaded with Cloudinary `resource_type: "auto"`, no signing and no
  `access_control`; `fileUrl` is a plain public CDN URL → confidentiality relies on URL
  secrecy (see Report 08).
