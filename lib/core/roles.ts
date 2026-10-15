
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


const ROLE_HOME: Record<ApiRole, string> = {
  CUSTOMER: "/dashboard/customer",
  SELLER: "/dashboard/seller",
  MODERATOR: "/dashboard/moderator",
  ADMIN: "/dashboard/admin",
};

const SEGMENT_ROLES: Record<string, readonly ApiRole[]> = {
  customer: ["CUSTOMER", "SELLER", "MODERATOR", "ADMIN"],
  seller: ["SELLER", "ADMIN"],
  moderator: ["MODERATOR", "ADMIN"],
  admin: ["ADMIN"],
  profile: ["CUSTOMER", "SELLER", "MODERATOR", "ADMIN"],
  "change-password": ["CUSTOMER", "SELLER", "MODERATOR", "ADMIN"],
};


const PRIVILEGED: readonly ApiRole[] = ["ADMIN"];


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


export function canAccessDashboardPath(
  pathname: string,
  role: ApiRole | undefined,
): boolean {
  if (!role) return false;
  if (PRIVILEGED.includes(role)) return true;

  if (pathname === "/dashboard" || pathname === "/dashboard/") return true;

  if (!pathname.startsWith("/dashboard/")) return true;

  
  const segments = pathname.split("/").filter(Boolean);
  for (let i = segments.length - 1; i > 0; i--) {
    const segment = segments[i];
    const allowed = SEGMENT_ROLES[segment];
    if (allowed) return allowed.includes(role);
  }


  return false;
}


const ROLE_LABEL: Record<ApiRole, string> = {
  CUSTOMER: "customer",
  SELLER: "seller",
  MODERATOR: "moderator",
  ADMIN: "admin",
};

export function roleLabel(role: ApiRole | undefined): string {
  return role ? ROLE_LABEL[role] : ROLE_LABEL.CUSTOMER;
}