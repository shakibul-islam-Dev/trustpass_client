# Report 07 — Backend Environment Divergence

**Status:** Finding — action needed from the team

## The problem

The backend exists in **two divergent states**. This directly affects the seller dashboard,
because one line contains a payments/free-listing feature the other does not.

| | Local `/media/shakil/Projects/trust-pass-server` | GitHub `origin/main` |
|---|---|---|
| HEAD | `982b824 fix:product service get update` | `6d530ce feat:payment bkash add` |
| Branch | `main` | `main` |
| Payments module | **Absent** | **Present** (`modules/payment`, `libs/bkash.ts`) |
| Payment model / enums | **Absent** | Present (`payment.prisma`, `PaymentStatus`, `PaymentPurpose`) |
| Free-listing rule | **Absent** | Present (first 5 free, then bKash `PRODUCT_SLOT`) |
| Product create | simple create | transaction + limit check + Cloudinary cleanup |
| Config | no bKash keys, no `free_product_limit` | bKash keys + `free_product_limit` (5) |
| `admin /users` route | `ADMIN` only | `ADMIN` + `MODERATOR` |
| `libs/auth.ts` | has `trustedOrigins` (uncommitted local edit) | no `trustedOrigins` |

`git merge-base --is-ancestor 982b824 6d530ce` → **false**. The two histories **diverged**;
the local commit is not in the clone's history at all.

## Why it matters

- If the project runs on the **local** line, there is **no product limit and no payments**,
  and my client-side "surface the 402 error" handling is simply never triggered.
- If the project runs on the **origin** line, the "first 5 free" rule applies and the client
  shows the server's payment-required message (no payment UI built, per instruction).

## Recommendation

Decide which backend line is authoritative (and what is actually deployed), then:

- Reconcile the divergence (probably by rebasing/pulling the payments work onto the local
  line, if that work is wanted).
- Note the uncommitted local edit `src/app/libs/auth.ts` (`trustedOrigins`) — keep or commit
  deliberately.

## Local working-tree changes observed

- `package-lock.json` (modified)
- `src/app/libs/auth.ts` (modified — added `trustedOrigins`)
