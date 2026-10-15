# Report 02 — Digital Trust Passport

**Status:** Done
**Audit items:** E1, E2, E3, E5 (E4, E6, E7 documented)

## What was the problem

There was no passport surface in the seller dashboard — no preview of the public profile
and no share affordance.

## What was done

- New passport page + sidebar entry.
- Renders a real preview of the public profile: cover, logo, business type, address,
  description, contact + social links, verification badge, trust-score ring.
- Shareable public URL (`/businesses/{slug || id}`) with a copy button.
- SSR-safe browser-origin read via `useSyncExternalStore` (no hydration mismatch).

Only fields the business API already returns are used — there is **no passport-specific
endpoint**, so nothing is fabricated.

## Files

- `components/seller/SellerTrustPassport.tsx` (new)
- `app/dashboard/seller/passport/page.tsx` (new)
- `lib/sidebarData.ts` (added sidebar entry)

## Backend evidence

- `GET /api/v1/businesses/me` → owned businesses.
- Public `GET /api/v1/businesses/:id` and `GET /api/v1/businesses/slug/:slug` →
  authoritative public fields.

## Not done (documented)

- **E4 public product catalogue:** the public buyer page `app/businesses/[id]` does not list
  products. Endpoint `GET /businesses/:id/products` is public, but wiring it is a
  buyer-facing change outside the strict seller-dashboard scope — see Report 08.
- **E6/E7:** public page exposes only public fields, but document URLs are public Cloudinary
  links (see Reports 06 & 08).
