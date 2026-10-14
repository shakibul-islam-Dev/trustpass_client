# Report 03 — Product Image Upload on Create

**Status:** Done
**Audit item:** D5 (add image upload to create flow)

## What was the problem

The product **create** modal (`SellerProductManagement.tsx`) had name/category/price/stock/
description but **no image field**. Images could only be set later on the detail page.

## What was done

- `lib/core/product-api.ts` → `createProduct()` now sends **multipart** (files under the
  `images` field) when image files are selected, and the previous JSON request when not.
- `SellerProductManagement.tsx` create dialog gained an image picker with the same rules as
  the detail-page editor: JPEG/PNG/WEBP, ≤ 5 MB each, max 10, previews, remove.

## Files

- `lib/core/product-api.ts` — conditional multipart create.
- `components/seller/SellerProductManagement.tsx` — create dialog image UI.

## Backend evidence (local backend)

- `POST /api/v1/products` is mounted with `uploadProductImages` (multer `.array("images", 10)`),
  so multipart create is correct.
- `createProductSchema`: `businessId` uuid required, `categoryId` uuid optional, `name` 2–255,
  `description` ≤10000, `price` ≥0 required, `currency` enum (default `BDT`), `stock` int ≥0,
  `status` enum (default `ACTIVE`).
- Multer limit is 5 MB per file; server caps a product at 10 images.

## Note

- The Overview/Dashboard status of a newly created product is `DRAFT` because the client
  sends `status: "DRAFT"` for new drafts. This matches the client UI (no status field in the
  create dialog) and the server accepts it. No change made.
