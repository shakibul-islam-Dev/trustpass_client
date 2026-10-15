// Product API — Admin panel
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";
import { apiFetch } from "@/lib/core/api-fetch";

// ============================================================
// Nested types (new backend response)
// ============================================================
export interface IProductImage {
  url: string;
  publicId?: string;
}

export interface IProductBusiness {
  id: string;
  name?: string;
  slug?: string;
  logoUrl?: string | null;
  owner?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
}

// ============================================================
// Product Response
// ============================================================
export interface IProductResponse {
  id: string;
  businessId: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  currency: string;
  stock: number;
  images: string[];              // ← normalized to string[]
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "DRAFT" | string;
  createdAt: string;
  updatedAt?: string;

  // 🆕 Nested business info (for table display)
  businessName?: string;
  businessSlug?: string;
  businessLogo?: string | null;

  // 🆕 Owner info (for notification)
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
}

export interface IProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

const buildQuery = (filters: IProductFilters): string => {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  const q = params.toString();
  return q ? `?${q}` : "";
};

// ============================================================
// Image normalizer — handle both string[] and { url, publicId }[]
// ============================================================
const normalizeImages = (raw: any): string[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((img) => {
      if (typeof img === "string") return img;
      if (img && typeof img === "object") {
        return img.url || img.secureUrl || img.src || null;
      }
      return null;
    })
    .filter((u): u is string => typeof u === "string" && u.trim().length > 0);
};

// ============================================================
// NORMALIZE
// ============================================================
const normalizeProduct = (raw: any): IProductResponse => ({
  id: raw.id,
  businessId: raw.businessId ?? raw.business_id,
  categoryId: raw.categoryId ?? raw.category_id,
  name: raw.name || "Untitled Product",
  slug: raw.slug,
  description: raw.description ?? null,
  price: Number(raw.price ?? 0),
  currency: raw.currency || "BDT",
  stock: Number(raw.stock ?? 0),
  images: Array.isArray(raw.images)
    ? raw.images
        .map((img: any) => (typeof img === "string" ? img : img?.url || ""))
        .filter(Boolean)
    : [],
  status: raw.status || "ACTIVE",
  createdAt: raw.createdAt ?? raw.created_at ?? "",
  updatedAt: raw.updatedAt ?? raw.updated_at,
});

// ============================================================
// GET /api/v1/products — list
// ============================================================
export const fetchAllProducts = async (
  filters: IProductFilters = {}
): Promise<IProductResponse[]> => {
  const url = apiUrl(`/api/v1/products${buildQuery(filters)}`);
  console.log("🔍 fetchAllProducts URL:", url);

  try {
    const response = await apiFetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.error("❌ fetchAllProducts:", response.status);
      return [];
    }

    const json = await response.json();
    console.log("📥 RAW products[0]:", json?.data?.[0] ?? json?.[0]);

    let rawArray: any[] = [];
    if (Array.isArray(json)) rawArray = json;
    else if (Array.isArray(json?.data)) rawArray = json.data;
    else if (Array.isArray(json?.products)) rawArray = json.products;
    else if (Array.isArray(json?.data?.products))
      rawArray = json.data.products;

    const normalized = rawArray.map(normalizeProduct);
    console.log("✅ Normalized products:", normalized.length);
    return normalized;
  } catch (error) {
    console.error("❌ fetchAllProducts exception:", error);
    return [];
  }
};

// ============================================================
// GET /api/v1/products/:id
// ============================================================
export const fetchProductById = async (
  id: string
): Promise<IProductResponse | null> => {
  try {
    const res = await apiFetch(apiUrl(`/api/v1/products/${id}`), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    const raw = json?.data ?? json;
    if (!raw) return null;
    return normalizeProduct(raw);
  } catch (error) {
    console.error("fetchProductById error:", error);
    return null;
  }
};

// ============================================================
// GET /api/v1/businesses/:id/products
// ============================================================
export const fetchProductsByBusiness = async (
  businessId: string
): Promise<IProductResponse[]> => {
  try {
    const res = await apiFetch(
      apiUrl(`/api/v1/businesses/${businessId}/products`),
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    let rawArray: any[] = [];
    if (Array.isArray(json)) rawArray = json;
    else if (Array.isArray(json?.data)) rawArray = json.data;
    else if (Array.isArray(json?.products)) rawArray = json.products;
    return rawArray.map(normalizeProduct);
  } catch (error) {
    console.error("fetchProductsByBusiness error:", error);
    return [];
  }
};