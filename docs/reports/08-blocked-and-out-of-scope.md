# Report 08 — Blocked & Out of Scope

**Status:** Documented
Every item below is **not** a client bug — each is blocked by the backend or by an explicit
scope rule (no payments). The exact reason is given so it can be picked up later.

| Item | Reason it is blocked | What would unblock it |
|---|---|---|
| Orders / revenue / pending-orders metrics | **No order module or model** exists in the backend | Build an Orders backend |
| Free-listing rule / listing limits (D8) | Local backend has **no** limit rule or payment module; GitHub line has it but it is payments work | Product/DB decision + payments — out of scope by instruction |
| Facebook social link (B4) | No `facebookUrl` anywhere in backend (interface/validation/schema) | Add field end-to-end on backend |
| Trust-score breakdown UI | `TrustScore.breakdown` only stores the first awarded rule; labeled ledger endpoint is **not routed** | Route a public lender/ledger endpoint, or maintain full `breakdown` |
| Business rejection reason (`adminNote`) & request history (C4/C5) | Only exposed via `/verifications`, which is `MODERATOR/ADMIN` only | Add a seller-scoped verification-status/history endpoint |
| Notification preferences (F3) | No preferences endpoint exists | Add a preferences API + persistence |
| Public product catalogue (E4) | Endpoint is public, but the target page is buyer-facing; also the passport preview would over-represent the public page | Product decision + buyer-page work |
| Document privacy (C7, P0) | Documents upload with `resource_type:"auto"`, **no signing / access_control**; `fileUrl` is a public Cloudinary URL | Backend: authenticated/signed delivery or `type:"authenticated"` + signed URLs |

## Explicitly untouched (per instruction)

- No payment, subscription, or billing work was created.
- The dead wizard field `facebokUrl` (your in-progress edit) was **not** modified or removed.
- No backend files were changed; the backend was read as reference only.
