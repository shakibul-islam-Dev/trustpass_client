"use server";

import { getData } from "../core/mutations";



// ============================================================
// BACKEND INTERFACES
// ============================================================

export interface ICategoryResponse {
  id: string;
  name: string;
  slug?: string;
  iconUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  productsCount?: number; // Optional - if backend provides it
}

export interface ICategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

// ============================================================
// BUILD QUERY STRING
// ============================================================

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

// ============================================================
// GET /api/v1/categories  — List categories (Public)
// ============================================================

export const fetchCategories = async (
  filters: ICategoryFilters = {}
): Promise<ICategoryResponse[]> => {
  const response = await getData(
    `/api/v1/categories${buildQuery(filters)}`
  );

  // Handle error
  if (response?.error || response?.success === false) {
    console.error("fetchCategories error:", response);
    return [];
  }

  // Handle different response shapes
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.categories)) return response.categories;

  console.warn("Unexpected response shape:", response);
  return [];
};

// ============================================================
// GET /api/v1/categories/:id  — Get single category
// ============================================================

export const fetchCategoryById = async (
  id: string
): Promise<ICategoryResponse | null> => {
  const response = await getData(`/api/v1/categories/${id}`);

  if (response?.error || response?.success === false) {
    return null;
  }

  return response?.data ?? response ?? null;
};