/**
 * Role-based access control, in one place.
 *
 * This module is the single source of truth for three things that used to be
 * decided independently and disagree with each other:
 *
 *   1. Which role owns which `/dashboard/*` subtree.
 *   2. Where a role lands after signing in.
 *   3. What the sidebar calls that role.
 *
 * The bug this replaces: `DashboardSideBar` and `DashboardRoleLabel` both used
 * to *infer* the user's role from the URL. That is backwards — it means the
 * page decides what you are. `/dashboard/admin` rendered the admin sidebar for
 * anyone who typed the URL, and a CUSTOMER who navigated there saw admin links.
 * The role now comes from the session (`useAuth`) and the URL is checked
 * against it.
 *
 * IMPORTANT — this is UX, not a security boundary. The session cookie is
 * httpOnly and owned by the API's domain, so this app's proxy cannot read it
 * and cannot enforce anything. The real boundary is the API's own `auth()`
 * middleware, which rejects an unauthorised request no matter what this app
 * renders. Everything here exists so people are not shown screens they cannot
 * use; it is not what keeps them out.
 */

/** Roles as stored by the API (prisma `user.role`). */
export type ApiRole = "CUSTOMER" | "SELLER" | "MODERATOR" | "ADMIN";

export const API_ROLES: readonly ApiRole[] = [
  "CUSTOMER",
  "SELLER",
  "MODERATOR",
  "ADMIN",
];

export function isApiRole(value: unknown): value is ApiRole {
  return (
    typeof value === "string" &&
    (API_ROLES as readonly string[]).includes(value)
  );
}

/**
 * The default landing page per role.
 *
 * These paths must exist. `/dashboard` itself has no page and is only ever a
 * redirect target, so it is handled separately in `homeForRole`.
 */
const ROLE_HOME: Record<ApiRole, string> = {
  CUSTOMER: "/dashboard/customer",
  SELLER: "/dashboard/seller",
  MODERATOR: "/dashboard/moderator",
  ADMIN: "/dashboard/admin",
};

/**
 * Which roles may enter which subtree.
 *
 * Keyed by the `/dashboard/<segment>` prefix, so a rule covers every page
 * beneath it. `""` is the bare `/dashboard` root, open to anyone signed in
 * because it only redirects onward.
 *
 * ADMIN is deliberately absent from the narrow rules below only where it adds
 * nothing: admins can reach every subtree, which is asserted by
 * `canAccessDashboardPath` rather than repeated in every list.
 */
const SEGMENT_ROLES: Record<string, readonly ApiRole[]> = {
  customer: ["CUSTOMER", "SELLER", "MODERATOR", "ADMIN"],
  seller: ["SELLER", "ADMIN"],
  moderator: ["MODERATOR", "ADMIN"],
  admin: ["ADMIN"],
  // /dashboard/change-password — every signed-in role may change its own
  // password, so it needs a rule of its own; without one the loop in
  // canAccessDashboardPath denies it to everyone except ADMIN.
  "change-password": ["CUSTOMER", "SELLER", "MODERATOR", "ADMIN"],
};

/** Roles that may reach any dashboard subtree. */
const PRIVILEGED: readonly ApiRole[] = ["ADMIN"];

/**
 * Where to send a role that has just signed in or verified an OTP.
 *
 * `pathname` is only used to preserve an intended destination that the role is
 * actually allowed to see — so a moderator who was deep-linked to
 * `/dashboard/moderator/reports` lands there, while an admin deep-linked to the
 * same path is not bounced out of it. An unknown role falls back to CUSTOMER,
 * the same default `useAuth` uses, so the two never disagree.
 */
export function homeForRole(
  role: ApiRole | undefined,
  pathname?: string,
): string {
  const fallback = ROLE_HOME.CUSTOMER;

  if (!role) return fallback;

  if (
    pathname &&
    pathname.startsWith("/dashboard") &&
    pathname !== "/dashboard" &&
    canAccessDashboardPath(pathname, role)
  ) {
    return pathname;
  }

  return ROLE_HOME[role] ?? fallback;
}

/**
 * Whether `role` may view `pathname`.
 *
 * Admins pass everywhere. Anything outside `/dashboard` is not this
 * function's business and returns true, leaving public pages alone.
 */
export function canAccessDashboardPath(
  pathname: string,
  role: ApiRole | undefined,
): boolean {
  if (!role) return false;
  if (PRIVILEGED.includes(role)) return true;

  if (pathname === "/dashboard" || pathname === "/dashboard/") return true;

  if (!pathname.startsWith("/dashboard/")) return true;

  // Longest matching segment wins, so a future `/dashboard/admin/settings`
  // style rule can be made narrower than `/dashboard/admin` without touching
  // the code here.
  const segments = pathname.split("/").filter(Boolean); // ["dashboard", "admin", ...]
  for (let i = segments.length - 1; i > 0; i--) {
    const segment = segments[i];
    const allowed = SEGMENT_ROLES[segment];
    if (allowed) return allowed.includes(role);
  }

  // A /dashboard page with no rule at all — deny rather than expose it.
  return false;
}

/**
 * Human-readable role name for the UI.
 *
 * The sidebar keys are not the API roles, which is what made the old mapping
 * table error-prone.
 */
const ROLE_LABEL: Record<ApiRole, string> = {
  CUSTOMER: "customer",
  SELLER: "seller",
  MODERATOR: "moderator",
  ADMIN: "admin",
};

export function roleLabel(role: ApiRole | undefined): string {
  return role ? ROLE_LABEL[role] : ROLE_LABEL.CUSTOMER;
}