// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";
import { apiFetch } from "@/lib/core/api-fetch";

// ============================================================
// Types
// ============================================================
export interface IProduct {
  id: string;
  businessId: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  currency: string;
  stock: number;
  images: string[];
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IProductListResponse {
  products: IProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  categoryId?: string;
  businessId?: string;
}

// ============================================================
// Normalize
// ============================================================
const normalizeProduct = (raw: any): IProduct => ({
  id: String(raw.id),
  businessId: raw.businessId ?? raw.business_id ?? "",
  categoryId: raw.categoryId ?? raw.category_id ?? "",
  name: raw.name || "Untitled Product",
  slug: raw.slug || String(raw.id),
  description: raw.description ?? null,
  price: Number(raw.price ?? 0),
  currency: raw.currency || "BDT",
  stock: Number(raw.stock ?? 0),
  images: Array.isArray(raw.images) ? raw.images : [],
  status: raw.status || "ACTIVE",
  createdAt: raw.createdAt ?? raw.created_at,
  updatedAt: raw.updatedAt ?? raw.updated_at,
});

const buildQuery = (filters: IProductFilters): string => {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  const q = params.toString();
  return q ? `?${q}` : "";
};

// ============================================================
// GET /api/v1/products — paginated list
// ============================================================
export const fetchProducts = async (
  filters: IProductFilters = {}
): Promise<IProductListResponse> => {
  const url = apiUrl(`/api/v1/products${buildQuery(filters)}`);
  console.log("🔍 fetchProducts URL:", url);

  try {
    const res = await apiFetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.error("❌ fetchProducts error:", res.status);
      return { products: [], total: 0, page: 1, limit: 12, totalPages: 0 };
    }

    const json = await res.json();
    console.log("📥 RAW products response:", json);

    // Handle various shapes
    let rawArray: any[] = [];
    let total = 0;
    let page = filters.page ?? 1;
    let limit = filters.limit ?? 12;

    if (Array.isArray(json)) {
      rawArray = json;
      total = json.length;
    } else if (Array.isArray(json?.data)) {
      rawArray = json.data;
      total = json.total ?? json.meta?.total ?? json.data.length;
      page = json.page ?? json.meta?.page ?? page;
      limit = json.limit ?? json.meta?.limit ?? limit;
    } else if (Array.isArray(json?.products)) {
      rawArray = json.products;
      total = json.total ?? json.products.length;
      page = json.page ?? page;
      limit = json.limit ?? limit;
    } else if (Array.isArray(json?.data?.products)) {
      rawArray = json.data.products;
      total = json.data.total ?? rawArray.length;
      page = json.data.page ?? page;
      limit = json.data.limit ?? limit;
    }

    const products = rawArray.map(normalizeProduct);
    const totalPages = Math.ceil(total / limit) || 1;

    return { products, total, page, limit, totalPages };
  } catch (error) {
    console.error("❌ fetchProducts exception:", error);
    return { products: [], total: 0, page: 1, limit: 12, totalPages: 0 };
  }
};

// ============================================================
// GET /api/v1/products/:id
// ============================================================
export const fetchProductById = async (
  id: string
): Promise<IProduct | null> => {
  try {
    const res = await apiFetch(apiUrl(`/api/v1/products/${id}`), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    const raw = json?.data ?? json?.product ?? json;
    if (!raw) return null;
    return normalizeProduct(raw);
  } catch (error) {
    console.error("fetchProductById error:", error);
    return null;
  }
};

// ============================================================
// GET /api/v1/products/slug/:slug
// ============================================================
export const fetchProductBySlug = async (
  slug: string
): Promise<IProduct | null> => {
  try {
    const res = await apiFetch(apiUrl(`/api/v1/products/slug/${slug}`), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    const raw = json?.data ?? json?.product ?? json;
    if (!raw) return null;
    return normalizeProduct(raw);
  } catch (error) {
    console.error("fetchProductBySlug error:", error);
    return null;
  }
};