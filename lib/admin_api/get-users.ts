"use server";

import { getData } from "../core/mutations";



// ============================================================
// BACKEND RESPONSE TYPE
// ============================================================

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

// ============================================================
// FILTERS TYPE (PLURAL)
// ============================================================

export interface IUserFilters {   // ← plural
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

// ============================================================
// BUILD QUERY
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
// GET /api/v1/users — List users (ADMIN)
// ============================================================

export const fetchUsers = async (
  filters: IUserFilters = {}   // ← plural
): Promise<IUserResponse[]> => {
  const url = `/api/v1/admin/users${buildQuery(filters)}`;
  console.log("🔍 fetchUsers URL:", url);

  const response = await getData(url);
  console.log("📥 fetchUsers raw response:", JSON.stringify(response, null, 2));

  if (response?.error || response?.success === false) {
    console.error("❌ fetchUsers error details:", {
      error: response?.error,
      success: response?.success,
      message: response?.message,
      status: response?.status,
      fullResponse: response,
    });
    return [];
  }

  // Handle different response shapes
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.users)) return response.users;

  console.warn("⚠️ Unexpected response shape:", response);
  return [];
};