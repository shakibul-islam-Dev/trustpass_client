// Business List (Admin) — API + normalize
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";
import { apiFetch } from "@/lib/core/api-fetch";
import type { TVerificationStatus } from "@/types/business";

export type { TVerificationStatus };

export interface IBusinessAddress {
  id?: string;
  addressLine?: string;
  city?: string;
  district?: string;
  division?: string;
  postalCode?: string;
  country?: string;
}

export interface IBusinessResponse {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  businessType?: "INDIVIDUAL" | "COMPANY";

  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;

  categoryId?: string;
  contactEmail?: string;
  contactPhone?: string;

  websiteUrl?: string | null;
  instaUrl?: string | null;
  tiktokUrl?: string | null;

  verificationStatus: TVerificationStatus;
  trustScore: number;
  productsCount: number;
  documentsCount: number;
  reportsCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt?: string;

  address?: IBusinessAddress | null;

  // Flag — full details load hoyeche ki na
  _detailsLoaded?: boolean;
}

export interface IBusinessFilters {
  page?: number;
  limit?: number;
  search?: string;
  verificationStatus?: TVerificationStatus;
}

const buildQuery = (filters: IBusinessFilters): string => {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.verificationStatus)
    params.set("verificationStatus", filters.verificationStatus);
  const q = params.toString();
  return q ? `?${q}` : "";
};

// ============================================================
// NORMALIZE — ADMIN list (limited fields)
// ============================================================
const normalizeBusiness = (raw: any): IBusinessResponse => {
  const owner = raw.owner ?? {};

  return {
    id: raw.id,
    name: raw.name || "Unknown Business",
    slug: raw.slug,
    description: raw.description ?? null,
    logoUrl: raw.logoUrl ?? null,
    coverUrl: raw.coverUrl ?? null,
    businessType: raw.businessType,

    ownerId: raw.ownerId ?? owner.id,
    ownerName: owner.name || raw.ownerName || "Business Owner",
    ownerEmail: owner.email || raw.contactEmail || "-",

    categoryId: raw.categoryId,
    contactEmail: raw.contactEmail ?? null,
    contactPhone: raw.contactPhone ?? null,

    websiteUrl: raw.websiteUrl ?? null,
    instaUrl: raw.instaUrl ?? null,
    tiktokUrl: raw.tiktokUrl ?? null,

    verificationStatus: raw.verificationStatus || "PENDING",
    trustScore: Number(raw.trustScore ?? 0),
    productsCount: Number(raw._count?.products ?? raw.productsCount ?? 0),
    documentsCount: Number(raw._count?.documents ?? 0),
    reportsCount: Number(raw._count?.reports ?? 0),
    isFeatured: Boolean(raw.isFeatured),

    createdAt: raw.createdAt ?? "",
    updatedAt: raw.updatedAt,

    address: raw.address ?? null,
    _detailsLoaded: false,
  };
};

// ============================================================
// NORMALIZE — PUBLIC single (full fields)
// ============================================================
const mergeFullDetails = (
  base: IBusinessResponse,
  full: any
): IBusinessResponse => {
  const addr = full.address ?? null;

  return {
    ...base,
    description: full.description ?? base.description,
    logoUrl: full.logoUrl ?? base.logoUrl,
    coverUrl: full.coverUrl ?? base.coverUrl,
    businessType: full.businessType ?? base.businessType,

    contactEmail: full.contactEmail ?? base.contactEmail,
    contactPhone: full.contactPhone ?? base.contactPhone,
    categoryId: full.categoryId ?? base.categoryId,

    websiteUrl: full.websiteUrl ?? base.websiteUrl,
    instaUrl: full.instaUrl ?? base.instaUrl,
    tiktokUrl: full.tiktokUrl ?? base.tiktokUrl,

    address: addr
      ? {
          id: addr.id,
          addressLine: addr.addressLine,
          city: addr.city,
          district: addr.district,
          division: addr.division,
          postalCode: addr.postalCode,
          country: addr.country,
        }
      : base.address,

    _detailsLoaded: true,
  };
};

// ============================================================
// GET /api/v1/admin/businesses — list (limited)
// ============================================================
export const fetchAllBusinesses = async (
  filters: IBusinessFilters = {}
): Promise<IBusinessResponse[]> => {
  const url = apiUrl(`/api/v1/admin/businesses${buildQuery(filters)}`);
  console.log("🔍 fetchAllBusinesses:", url);

  try {
    const response = await apiFetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.error("❌ fetch error:", response.status);
      return [];
    }

    const json = await response.json();

    let rawArray: any[] = [];
    if (Array.isArray(json)) rawArray = json;
    else if (Array.isArray(json?.data)) rawArray = json.data;
    else if (Array.isArray(json?.businesses)) rawArray = json.businesses;
    else if (Array.isArray(json?.data?.businesses))
      rawArray = json.data.businesses;

    const normalized = rawArray.map(normalizeBusiness);
    console.log("✅ Loaded", normalized.length, "businesses");
    return normalized;
  } catch (error) {
    console.error("❌ fetch exception:", error);
    return [];
  }
};

// ============================================================
// GET /api/v1/businesses/:id — full details (merge)
// ============================================================
export const fetchBusinessFullDetails = async (
  businessId: string
): Promise<any | null> => {
  const url = apiUrl(`/api/v1/businesses/${businessId}`);
  console.log("🔍 fetchBusinessFullDetails:", url);

  try {
    const response = await apiFetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.warn("⚠️ Full details fetch failed:", response.status);
      return null;
    }

    const json = await response.json();
    console.log("📥 Full details raw:", json);

    // Handle various shapes
    const data = json?.data ?? json?.business ?? json;
    return data;
  } catch (error) {
    console.error("❌ fetchBusinessFullDetails exception:", error);
    return null;
  }
};

// ============================================================
// Merged helper — list item + full details
// ============================================================
export const fetchBusinessWithDetails = async (
  business: IBusinessResponse
): Promise<IBusinessResponse> => {
  // Already loaded? Return as-is
  if (business._detailsLoaded) return business;

  const full = await fetchBusinessFullDetails(business.id);
  if (!full) return business; // fallback to list data

  return mergeFullDetails(business, full);
};