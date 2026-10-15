// Updated implementation for: User Management page (Admin)
// Client-side fetch — cookie automatic goes via credentials: "include".
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";
import { apiFetch } from "@/lib/core/api-fetch";

// ============================================================
// Types
// ============================================================
export interface IUserResponse {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  image?: string | null;

  // 🆕 Role — safe union
  role: "ADMIN" | "MODERATOR" | "SELLER" | "CUSTOMER";

  // 🆕 Status — for block/unblock
  status?: "ACTIVE" | "BLOCKED" | "PENDING" | "SUSPENDED" | string;

  // 🆕 Optional profile
  phone?: string | null;
  gender?: string | null;

  createdAt: string;
  updatedAt?: string;
}

export interface IUserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

// ============================================================
// Query builder
// ============================================================
const buildQuery = (filters: IUserFilters): string => {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.role) params.set("role", filters.role);
  const query = params.toString();
  return query ? `?${query}` : "";
};

// ============================================================
// Normalize
// ============================================================
const normalizeUser = (raw: any): IUserResponse => ({
  id: raw.id,
  name: raw.name ?? "Unknown User",
  email: raw.email ?? "",
  emailVerified: raw.emailVerified ?? raw.email_verified ?? false,
  image: raw.image ?? null,
  role: raw.role ?? "CUSTOMER",
  status: raw.status ?? "ACTIVE",
  phone: raw.phone ?? null,
  gender: raw.gender ?? null,
  createdAt: raw.createdAt ?? raw.created_at ?? "",
  updatedAt: raw.updatedAt ?? raw.updated_at,
});

// ============================================================
// GET /api/v1/admin/users — List users (ADMIN)
// ============================================================
export const fetchUsers = async (
  filters: IUserFilters = {}
): Promise<IUserResponse[]> => {
  const url = apiUrl(`/api/v1/admin/users${buildQuery(filters)}`);
  console.log("🔍 fetchUsers URL:", url);

  try {
    const response = await apiFetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    console.log("📥 fetchUsers status:", response.status);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("❌ fetchUsers error:", response.status, errorText);
      return [];
    }

    const data = await response.json();
    console.log("📥 fetchUsers raw data:", data);

    // Handle different response shapes
    let rawArray: any[] = [];
    if (Array.isArray(data)) rawArray = data;
    else if (Array.isArray(data?.data)) rawArray = data.data;
    else if (Array.isArray(data?.data?.data)) rawArray = data.data.data;
    else if (Array.isArray(data?.users)) rawArray = data.users;

    if (rawArray.length === 0) {
      console.warn("⚠️ No users array found in response:", data);
      return [];
    }

    const normalized = rawArray.map(normalizeUser);
    console.log("✅ fetchUsers normalized:", normalized.length);
    return normalized;
  } catch (error) {
    console.error("❌ fetchUsers exception:", error);
    return [];
  }
};