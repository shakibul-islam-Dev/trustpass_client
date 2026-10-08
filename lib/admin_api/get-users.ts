// Previous implementation by: Existing Developer
// Kept for reference because Server Action cannot send cross-origin cookies.
//
// "use server";
// import { getData } from "../core/mutations";
// export const fetchUsers = async () => {
//   const response = await getData("/api/v1/admin/users");
//   // ...
// };

// Updated implementation for: User Management page (Admin)
// Client-side fetch — cookie automatic goes via credentials: "include".
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";

export interface IUserResponse {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: "ADMIN" | "MODERATOR" | "BUYER" | "CUSTOMER";
  createdAt: string;
  updatedAt: string;
}

export interface IUserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

const buildQuery = (filters: IUserFilters): string => {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.role) params.set("role", filters.role);
  const query = params.toString();
  return query ? `?${query}` : "";
};

export const fetchUsers = async (
  filters: IUserFilters = {}
): Promise<IUserResponse[]> => {
  const url = apiUrl(`/api/v1/admin/users${buildQuery(filters)}`);
  console.log("🔍 fetchUsers URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",   // ← Cookie automatic (browser)
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
    console.log("📥 fetchUsers data:", data);

    // Handle different response shapes
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.data)) return data.data.data;
    if (Array.isArray(data?.users)) return data.users;

    console.warn("⚠️ Unexpected response shape:", data);
    return [];
  } catch (error) {
    console.error("❌ fetchUsers exception:", error);
    return [];
  }
};