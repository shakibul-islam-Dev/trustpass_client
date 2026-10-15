# Report 04 — Business Social Links

**Status:** Done
**Audit items:** B4 (partial), B6

## What was the problem

Social/website links were entered without validation. The server rejects invalid URLs, so a
malformed link produced an opaque backend error.

## What was done

- New shared helper `lib/core/url.ts`: `isHttpUrl()` and `validateSocialLinks()`.
- `components/buisness/BuisnessUpdateForm.tsx` — validates Website / Instagram / TikTok
  before submit (same rule the server applies: `z.string().url()`).
- `components/seller/BusinessCreationWizard.tsx` — validates the same three links, and moves
  the wizard back to step 0 with a clear message if a link is invalid.

## Files

- `lib/core/url.ts` (new)
- `components/buisness/BuisnessUpdateForm.tsx`
- `components/seller/BusinessCreationWizard.tsx`

## Backend evidence (local backend)

`createBusinessSchema` / `updateBusinessSchema` in `business.validation.ts` accept only
`websiteUrl`, `instaUrl`, `tiktokUrl` as `z.string().url().optional()`. **No Facebook field
exists.**

## Not done (documented)

- **Facebook:** there is no `facebookUrl` in the backend interface, validation or schema, so
  it cannot be added end-to-end. The wizard's unused `facebokUrl` draft field (your
  in-progress edit) was **left untouched** — see Report 08.
