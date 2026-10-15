# Report 05 — Bug Fixes

**Status:** Done

Three genuine seller-dashboard defects were found by comparing the client against the
backend contracts and fixed.

## Fix 1 — Product category was always dropped

- **File:** `components/seller/SellerProductManagement.tsx:61`
- **Defect:** `toInput()` tested `draft.category` (a display **name**) against a UUID regex
  instead of `draft.categoryId`. Because the name is never a UUID, `categoryId` was always
  `undefined`, so the quick create/edit modal never assigned a category.
- **Fix:** test/use `draft.categoryId`.
- **Note:** the detail-page editor (`ProductUpdateComponent.tsx`) was already correct.

## Fix 2 — "Submit for review" enabled without an approved document

- **File:** `components/seller/SellerBusinessVerification.tsx:283`
- **Defect:** the backend's `submitVerification` requires **at least one `APPROVED`**
  business document (otherwise `422 Unprocessable Entity`). The card even documented this
  rule, but the button was enabled with 0 approved documents → guaranteed error on click.
- **Fix:** `canSubmit` now also requires `approvedCount > 0`.

## Fix 3 — Wrong trust-score history type

- **File:** `lib/core/business-api.ts:312`
- **Defect:** `TrustScoreHistoryEntry` declared `{ score?, reason?, createdAt?, changedBy? }`,
  which does not match the real response.
- **Fix:** corrected to `{ id, businessId, score, breakdown, businessType, calculatedAt }`
  and documented that `breakdown` is only partially populated server-side.

## Backend evidence

- Product create/update schemas & multipart contract — `product.validation.ts`,
  `product.route.ts`.
- Submit rule — `verification.service.ts` `submitVerification()` (checks `APPROVED` doc,
  then sets `verificationStatus = PENDING` in one transaction).
- Trust response — `trust.service.ts` `getTrustScoreHistory()` returns serialized
  `TrustScore` rows.
