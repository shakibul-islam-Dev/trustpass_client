// Updated implementation for: Business List (Admin)
// Client-side fetch + response normalization.
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";

export type TVerificationStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED"
  | "VERIFIED"; // backend may still return this alias

export interface IBusinessResponse {
  id: string;
  name: string;
  slug?: string;
  ownerName?: string;
  ownerEmail?: string;
  category?: string;
  phone?: string;
  location?: string;
  verificationStatus: TVerificationStatus;
  trustScore: number;
  productsCount: number;
  tradeLicenseNo?: string;
  isFeatured: boolean;
  createdAt: string;
}

export interface IBusinessFilters {
  page?: number;
  limit?: number;
  search?: string;
  verificationStatus?: TVerificationStatus;
  categoryId?: string;
}

const buildQuery = (filters: IBusinessFilters): string => {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.verificationStatus)
    params.set("verificationStatus", filters.verificationStatus);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  const query = params.toString();
  return query ? `?${query}` : "";
};

// ============================================================
// NORMALIZE — backend nested object → flat UI shape
// ============================================================

const normalizeBusiness = (raw: any): IBusinessResponse => {
  const business = raw.business || raw;
  const owner = business.owner || raw.owner || {};

  return {
    id: business.id || raw.id,
    name: business.name || "Unknown Business",
    slug: business.slug,

    ownerName:
      raw.ownerName ||
      owner.name ||
      business.ownerName ||
      "-",

    ownerEmail:
      raw.ownerEmail ||
      owner.email ||
      business.ownerEmail ||
      "-",

    category:
      raw.category ||
      business.category?.name ||
      business.categoryName ||
      "-",

    phone: business.contactPhone || business.phone,
    location:
      business.address?.city ||
      business.address?.district ||
      business.location,

    verificationStatus:
      business.verificationStatus ||
      raw.verificationStatus ||
      "PENDING",

    trustScore: Number(business.trustScore ?? raw.trustScore ?? 0),

    productsCount: Number(
      business.productsCount ?? business._count?.products ?? raw.productsCount ?? 0
    ),

    tradeLicenseNo:
      business.tradeLicenseNo ||
      business.tradeLicense ||
      raw.tradeLicenseNo ||
      "-",

    isFeatured: Boolean(business.isFeatured ?? raw.isFeatured),

    createdAt: business.createdAt || raw.createdAt,
  };
};

// ============================================================
// GET /api/v1/admin/businesses — List all businesses (ADMIN)
// ============================================================

export const fetchAllBusinesses = async (
  filters: IBusinessFilters = {}
): Promise<IBusinessResponse[]> => {
  const url = apiUrl(`/api/v1/admin/businesses${buildQuery(filters)}`);
  console.log("🔍 fetchAllBusinesses URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    console.log("📥 fetchAllBusinesses status:", response.status);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("❌ fetchAllBusinesses error:", response.status, errorText);
      return [];
    }

    const json = await response.json();
    console.log("📥 fetchAllBusinesses raw:", json);

    let rawArray: any[] = [];
    if (Array.isArray(json)) rawArray = json;
    else if (Array.isArray(json?.data)) rawArray = json.data;
    else if (Array.isArray(json?.businesses)) rawArray = json.businesses;
    else if (Array.isArray(json?.data?.businesses)) rawArray = json.data.businesses;

    return rawArray.map(normalizeBusiness);
  } catch (error) {
    console.error("❌ fetchAllBusinesses exception:", error);
    return [];
  }
};