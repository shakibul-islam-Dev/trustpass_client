# 🌿 TrustPass — Design Blueprint (HeroUI v3-inspired, Pure Tailwind v4)

> Owner: **Shakibul** · Branch: `shakibul`
> Scope: UI/UX for the features listed in `PROJECT_CONTEXT.md` §15.
> Constraint: **Do NOT install the HeroUI package.** Everything below is built with the
> project's existing `tailwindcss@4` + `@shadcn/react` primitives (base-ui powered) and hand-written classes.
>
> This document is the single source of truth. Each phase is implemented one file at a
> time, tested with `next build`, and never touches another developer's files without permission.

---

## 1. Design Direction

**"Calm, confident, trustworthy."** We mirror HeroUI v3's philosophy:

1. **Semantic intent over visual style** — variants are named by hierarchy
   (`primary`, `secondary`, `tertiary`, `danger`), never by texture (`solid`, `flat`).
2. **One accent, used sparingly** — a single blue accent drives attention to exactly one
   primary action per screen. Everything else is a quiet neutral.
3. **Neutral backbone, elevation by surface, not color** — hierarchy comes from
   `surface`, `surface-secondary`, `surface-tertiary` and soft shadows.
4. **Smooth + eye-catching without noise** — every interaction has a 150–200ms eased
   transition; pressed controls scale to `0.97`; focus is a 2px ring.
5. **Accessibility as foundation** — WCAG-AA contrast, keyboard focus rings, semantic HTML.
6. **Responsive by default** — mobile-first grids, fluid type (clamp), wrap-friendly controls.
7. **Composition over configuration** — reuse the existing `components/ui/*` primitives.
8. **Predictable** — same size set (`sm`, `md`, `lg`), same states everywhere.

### Why this looks "HeroUI"
- Barely-there neutral background, white/`surface` cards, hairline `--border`.
- A saturated-but-deep blue accent with a subtle colored focus ring.
- Soft layered shadows in light mode; **no shadows in dark mode** (HeroUI does this too).
- Rounded radius (`0.5rem` base, fields `0.75rem`), generous padding, tight headings.

---

## 2. Design Tokens (Tailwind v4 `@theme`)

> Format follows the existing `app/globals.css` (`@theme inline` + CSS variables), so this
> drops into the current file without a rewrite. Colors are the **real HeroUI v3 tokens**.

### 2.1 Primitives (never change between modes)
| Token | Light & Dark |
|---|---|
| `--white` | `oklch(100% 0 0)` |
| `--black` | `oklch(0% 0 0)` |
| `--snow` | `oklch(0.9911 0 0)` |
| `--eclipse` | `oklch(0.2103 0.0059 285.89)` |

### 2.2 Light theme
| Token | Value |
|---|---|
| `--background` | `oklch(0.9702 0 0)` |
| `--foreground` | `var(--eclipse)` |
| `--surface` | `var(--white)` |
| `--surface-secondary` | `oklch(0.9524 0.0013 286.37)` |
| `--surface-tertiary` | `oklch(0.9373 0.0013 286.37)` |
| `--muted` | `oklch(0.5517 0.0138 285.94)` |
| `--default` | `oklch(94% 0.001 286.375)` |
| **`--accent`** | **`oklch(0.6204 0.195 253.83)`** |
| `--accent-foreground` | `var(--snow)` |
| `--success` | `oklch(0.7329 0.1935 150.81)` |
| `--warning` | `oklch(0.7819 0.1585 72.33)` |
| `--danger` | `oklch(0.6532 0.2328 25.74)` |
| `--border` / `--separator` | `oklch(92% 0.004 286.32)` |
| `--field-background` | `var(--white)` |
| `--field-placeholder` | `var(--muted)` |
| `--backdrop` | `rgba(0, 0, 0, 0.5)` |
| `--focus` | `var(--accent)` |

### 2.3 Dark theme
| Token | Value |
|---|---|
| `--background` | `oklch(12% 0.005 285.823)` |
| `--foreground` | `var(--snow)` |
| `--surface` | `oklch(0.2103 0.0059 285.89)` |
| `--surface-secondary` | `oklch(0.257 0.0037 286.14)` |
| `--surface-tertiary` | `oklch(0.2721 0.0024 247.91)` |
| `--muted` | `oklch(70.5% 0.015 286.067)` |
| `--default` | `oklch(27.4% 0.006 286.033)` |
| `--default-foreground` | `var(--snow)` |
| `--accent` | `oklch(0.6204 0.195 253.83)` |
| `--border` / `--separator` | `oklch(22% 0.006 286.033)` |
| `--field-background` | `var(--default)` |
| `--backdrop` | `rgba(0, 0, 0, 0.6)` |

### 2.4 Shape, spacing, shadow, motion
| Token | Value |
|---|---|
| `--radius` | `0.5rem` |
| `--field-radius` | `calc(var(--radius) * 1.5)` = `0.75rem` |
| `--spacing` | `0.25rem` |
| `--border-width` | `1px` |
| `--ring-offset-width` | `2px` |
| `--disabled-opacity` | `0.5` |
| `--surface-shadow` (light) | `0 2px 4px 0 rgb(0 0 0 / 0.04), 0 1px 2px 0 rgb(0 0 0 / 0.06), 0 0 1px 0 rgb(0 0 0 / 0.06)` |
| `--overlay-shadow` (light) | `0 4px 16px 0 rgb(24 24 27 / 0.08), 0 8px 24px 0 rgb(24 24 27 / 0.09)` |
| shadows (dark) | `transparent` (none) — elevation by surface only |
| **motion** | `--duration-fast: 150ms; --duration-base: 200ms;` ease `cubic-bezier(0.4, 0, 0.2, 1)` |
| press scale | `--press-scale: 0.97` |

Derived pseudo-tokens (via `color-mix(in oklab, ...)`):
- `--accent-hover` = accent 90% + accent-foreground 10%
- `--accent-soft` = accent 15% + transparent · `--accent-soft-hover` = 20%
- same soft/hover recipe for `--success`, `--warning`, `--danger`

### 2.5 Tailwind mapping (`@theme inline`)
```css
--color-background: var(--background);
--color-foreground: var(--foreground);
--color-surface: var(--surface);
--color-surface-secondary: var(--surface-secondary);
--color-surface-tertiary: var(--surface-tertiary);
--color-muted: var(--muted);
--color-default: var(--default);
--color-default-foreground: var(--default-foreground);
--color-accent: var(--accent);
--color-accent-foreground: var(--accent-foreground);
--color-success: var(--success);
--color-warning: var(--warning);
--color-danger: var(--danger);
--color-border: var(--border);
--color-separator: var(--separator);
--color-focus: var(--focus);
--radius-md: var(--radius);        /* 0.5rem */
--radius-lg: var(--field-radius);  /* 0.75rem */
--shadow-surface: var(--surface-shadow);
--shadow-overlay: var(--overlay-shadow);
```

> **Migration note:** in this codebase (shadcn convention) the brand CTA is **`--primary`**
> and `--accent` is the *neutral hover highlight* used by menus/dropdowns. So the HeroUI
> **accent blue maps to `--primary`**, and `--accent` stays neutral. All button/chip specs
> below use `bg-primary` (brand) / `bg-accent` (hover) accordingly.

---

## 3. Typography

| Role | Spec |
|---|---|
| Base body | Geist Sans / Inter (`--font-sans`), fluid `--text-base-fluid`, `line-height ~1.5`, `antialiased` |
| Headings | Geist Sans (`--font-heading`), `tracking -0.02em`, `text-wrap: balance`, `line-height 1.15` |
| Display | `--text-5xl-fluid` → `clamp(2.75rem, 2.1rem + 2.5vw, 3.75rem)`, weight 800 |
| H1 | `--text-4xl-fluid`, weight 800 · H2 `3xl`/700 · H3 `2xl`/700 · H4 `xl`/600 · H5 `base`/600 · H6 `sm`/600 |
| Numeric / scores | `tabular-nums` + `font-mono` for trust scores, counts, prices |
| Micro-labels | `text-xs`, `font-semibold`, `uppercase`, `tracking-wide`, `text-muted` — used above form fields |
| Links | underline on hover only, `text-foreground`, `--link` |

The fluid scale (already added in `globals.css`): `--text-xs-fluid` … `--text-5xl-fluid` (clamp-based).

---

## 4. Component Specs

> All classes below assume token mapping from §2.5. Existing `components/ui/*` primitives
> stay; these are the *look* we apply.

### 4.1 Button (semantic variants — 1 primary per screen)
| Variant | Spec |
|---|---|
| `primary` (accent) | `bg-primary text-primary-foreground` (from `--primary` = HeroUI blue), radius `--field-radius`, `font-medium`, `py-2.5 px-4` (md) |
| `secondary` (default) | `bg-default text-default-foreground hover: [96/4 mix]` |
| `tertiary` (outline) | `border border-border bg-transparent hover:bg-surface-secondary` (cancel/skip) |
| `danger` | `bg-danger text-danger-foreground hover:bg-danger/90` + `--danger-soft` ghost variant |
| press state | `active:scale-[0.97]` + `transition-[transform,background-color] duration-150` |
| disabled | `opacity-50 cursor-not-allowed` |
| loading | inline `Spinner` + text swap, width preserved |

### 4.2 Form field / Input
| Part | Spec |
|---|---|
| wrapper | `bg-surface` (light) / `bg-field` (dark) |
| field | `--field-radius`, `px-3.5 py-2.5`, `text-base-fluid`, `placeholder:text-muted`, hairline `border-border` (light), **no border in dark** |
| focus | 2px accent ring: `focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2` |
| label | `text-sm font-medium text-foreground`, optional `text-xs uppercase` micro style |
| helper/description | `text-sm text-muted` |
| error | `text-danger` + field `aria-invalid` → `border-danger ring-danger/40` |
| micro-interaction | `transition-[border-color,box-shadow] duration-150` |

### 4.3 Radio / select-replacement chip (this project uses radios)
| State | Spec |
|---|---|
| unselected | `flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-medium text-foreground hover:bg-surface-secondary hover:border-separator-secondary` |
| selected | `border-primary bg-primary text-primary-foreground shadow-surface` |
| press | `active:scale-[0.97] transition-all duration-150` |
| keyboard | same focus ring as field |
| group | `flex flex-wrap gap-2` (wraps on mobile) |

> Form-card variant (used in RegistrationForm): full-width row card `rounded-field border px-4 py-3`, selected → `border-primary bg-primary text-primary-foreground`.

### 4.4 Card / Surface
| Layer | Spec |
|---|---|
| plain card | `bg-surface rounded-lg border border-border`, `--shadow-surface` in light / none in dark |
| hover card | `hover:border-separator hover:shadow-overlay hover:-translate-y-0.5 transition-all duration-200` |
| interactive row | `px-4 py-3 hover:bg-surface-secondary rounded-md` |

### 4.5 Modal / Dialog
| Part | Spec |
|---|---|
| window | `bg-surface rounded-xl shadow-overlay`, max-w per content |
| backdrop | `bg-backdrop backdrop-blur-[2px]` |
| header | title `text-lg font-semibold tracking-tight`, close ghost button |
| enter/exit | opacity + translate-y-2 scale-95 → 100, `duration-200 ease-out` (CSS only) |
| footer | right-aligned actions: primary + tertiary |

### 4.6 Table
| Part | Spec |
|---|---|
| container | `rounded-lg border border-border bg-surface overflow-hidden` |
| head | `bg-surface-secondary text-xs font-semibold uppercase tracking-wide text-muted` |
| row | `border-t border-separator hover:bg-surface-secondary/60 transition-colors` |
| cell | `px-4 py-3 text-sm` |
| responsive | horizontal scroll wrapper: `overflow-x-auto` |

### 4.7 Status badge / chip
| Intent | Spec |
|---|---|
| `default` | `bg-default/80 text-default-foreground` |
| `success` | `bg-success-soft text-success` |
| `warning` | `bg-warning-soft text-warning` |
| `danger` | `bg-danger-soft text-danger` |
| `accent` | `bg-accent-soft text-accent` |
| shape | `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium` |

### 4.8 Skeleton / loading
- `animate-pulse bg-surface-tertiary rounded-md` (HeroUI default shimmer optional; pulse is quietest).

---

## 5. Motion & Interaction Layer

Defined once, used everywhere:

```css
/* token */
--ease: cubic-bezier(0.4, 0, 0.2, 1);           /* 150ms  fast micro-move  */
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--press-scale: 0.97;
```

Rules (in `@layer base` / as utilities):
1. `transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-150 ease-(--ease)`
   on all interactive elements.
2. Pressed controls scale to `0.97` (`:active` / `data-pressed`).
3. Cards lift `-translate-y-0.5` + softer shadow on hover.
4. Focus is **keyboard-only**: `:focus-visible` ring, never `:focus` smudges.
5. Modals/popovers: 200ms fade + 4px vertical drift, `ease-out`.
6. Route/loading: skeleton pulse, no layout jump.
7. `prefers-reduced-motion: reduce` → all transitions/animations collapsed (already in `globals.css`).

---

## 6. Page-Level Blueprint (Shakibul's scope)

> Layout skeleton = atomic sections so each can be developed + tested alone.

### 6.1 Auth screens (login / register / forgot / reset / change-password)
```
┌────────────────────────────────────────────┐
│ Center card  w-full max-w-md  mx-auto py-12 │
│  Logo mark (trust-shield)                  │
│  <h1>  (fluid) + 1-line sub (text-muted)    │
│  ┌ field ───────────────────────────────┐   │
│  │ label · input                        │   │
│  └──────────────────────────────────────┘   │
│  [radio group where relevant → chips]       │
│  [options row: "forgot?" right-aligned]     │
│  [primary button w-full]                    │
│  [tertiary link: switch screen]             │
└────────────────────────────────────────────┘
```
Responsive: card `px-6 py-8 sm:px-8`; fields full width; radios wrap.

### 6.2 Dashboard layout (seller/buyer)
- Sidebar `w-64` desktop / slide-over mobile (`SidebarProvider` already in place).
- Top bar: page title (h1), search, avatar dropdown.
- Content: `p-4 sm:p-6 lg:p-8`, `space-y-6`, max-w `7xl` centered.
- Stat cards: 3–4 across → 1 column mobile.

### 6.3 Business creation wizard (items #5, #6)
- Stepper (1 Business → 2 Category → 3 Address → 4 Documents).
- Category selector = radio chip grid (`flex flex-wrap gap-2`), card selections on mobile.
- Document upload = dropzone cards with status chip (Pending/Approved/Rejected).

### 6.4 Profile management UI (item #2, pluggable into a route)
- Card row: avatar (with camera overlay → item #4 upload) + name/email + role chip.
- Sections: Personal info (fields), Security (change-password link), Documents.
- `ProfileManagement.tsx` replaced from stub to this spec.

### 6.5 Product add/edit/delete (items #10–12)
- Reuse report-form card style; delete = `AlertDialog` tertiary/danger.
- Tables keep §4.6 spec + pagination row (§23 later).

### 6.6 Payments (items #20–22) — deferred until API contract known
- Checkout card → success page (accent check + summary) → failure page (warning + retry).

---

## 7. Responsive Strategy

| Breakpoint | Rule |
|---|---|
| base | single column, tap-sized controls (`min-h-11`), no side-by-side filters |
| `sm` (640) | 2-col stat grids, inline nav actions |
| `md` (768) | filters align, tables scroll horizontally, 3-col grids |
| `lg` (1024) | sidebar visible, 4-col grids, max-w `7xl` |
| `xl` (1280)+ | fluid type stops growing (clamp caps) |

Universal rules:
- Wrap-friendly controls: `flex flex-wrap gap-2/4` for chips, filters, action rows.
- `w-full` on touch controls; fixed widths only ≥ `sm`.
- Fluid typography via clamp scale (done).
- Touch target ≥ 40px (`min-h-11` / `py-2.5`).

---

## 8. Implementation Phases (one file at a time, build after each)

| Phase | What | Files |
|---|---|---|
| **P0 — Started** | Fluid type, heading font, base polish, reduced-motion | `app/globals.css` ✅ |
| **P1 — Tokens** | Port §2 tokens (accent/surface/success/etc.), keep primary aliases, shadow/radius/motion tokens | `app/globals.css` |
| **P2 — Primitives** | Apply component look to shared `components/ui/*` (button, input, radio-group, card, dialog, badge, table) | `components/ui/*` |
| **P3 — Auth flows** | Refresh login/register/forgot/reset/change screens to §6.1 spec (radios already in RegistrationForm) | `components/auth/*`, `components/password/*`, `components/otp/*` |
| **P4 — Profile** | Build profile management UI + photo upload (#2, #4) | `components/profile/*`, new `app/.../profile/page.tsx` |
| **P5 — Business** | Business creation form + category selector + dashboard + address + documents (#5–#9) | `components/buisness/*`, `app/dashboard/seller/*` |
| **P6 — Products** | Product add/edit/delete (#10–#12) | `components/dashboard/*` |
| **P7 — Polish** | Doc-status indicators (#13), trust badge consistency (#14), tables/pagination (#23), responsive pass (#26) | varied (branch-owned files only) |

Each phase: **File → Why → What → Test** per `PROJECT_CONTEXT.md`.

---

## 9. Acceptance Checklist

- [ ] Visual matches HeroUI-v3 mood: neutral base, single accent, soft light shadows, no dark shadows
- [ ] Semantics over style — variant names are `primary/secondary/tertiary/danger`
- [ ] All interactive elements: 150–200ms eased transitions + `active:scale-97`
- [ ] Keyboard-only focus rings (2px accent, offset)
- [ ] Every screen responsive to ≤ 360px without horizontal scroll
- [ ] Contrast ≥ WCAG AA on all text/foreground pairs (verified against the OKLCH tokens)
- [ ] `prefers-reduced-motion` honored
- [ ] One primary CTA per screen
- [ ] No HeroUI package installed; pure Tailwind v4
- [ ] `next build` + `eslint` green after each phase