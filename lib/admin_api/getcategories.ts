// Previous implementation by: Aritro (Server Action)
// Kept for reference because Server Action cannot send cross-origin cookies.
//
// import { getData } from "../core/mutations";
// export const fetchCategories = async () => {
//   const response = await getData("/api/v1/categories");
//   // ...
// };

// Updated implementation for: Categories page (Client-side fetch)
// This runs in the browser, so `credentials: "include"` sends the session
// cookie automatically — no manual forwarding needed.

import { apiUrl } from "@/lib/core/api-url";

export interface ICategoryResponse {
  id: string;
  name: string;
  slug?: string;
  iconUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  productsCount?: number;
}

export interface ICategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

const buildQuery = (filters: ICategoryFilters): string => {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.isActive !== undefined)
    params.set("isActive", String(filters.isActive));
  const query = params.toString();
  return query ? `?${query}` : "";
};

export const fetchCategories = async (
  filters: ICategoryFilters = {}
): Promise<ICategoryResponse[]> => {
  const url = apiUrl(`/api/v1/categories${buildQuery(filters)}`);
  console.log("🔍 fetchCategories URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",   // ← Cookie automatic goes (browser)
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    console.log("📥 fetchCategories status:", response.status);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("❌ fetchCategories error:", response.status, errorText);
      return [];
    }

    const data = await response.json();
    console.log("📥 fetchCategories data:", data);

    // Handle different response shapes
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.categories)) return data.categories;

    console.warn("⚠️ Unexpected response shape:", data);
    return [];
  } catch (error) {
    console.error("❌ fetchCategories exception:", error);
    return [];
  }
};

export const fetchCategoryById = async (
  id: string
): Promise<ICategoryResponse | null> => {
  try {
    const response = await fetch(apiUrl(`/api/v1/categories/${id}`), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data?.data ?? data ?? null;
  } catch (error) {
    console.error("fetchCategoryById error:", error);
    return null;
  }
};