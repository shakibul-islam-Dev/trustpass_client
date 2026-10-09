// Updated implementation for: Business Verifications (Admin/Moderator)
// Client-side fetch + response normalization.
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";

export type TVerificationStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

export interface IVerificationDocument {
  id: string;
  documentType: string;
  fileUrl: string;
  status?: string;
  uploadedAt?: string;
}

export interface IVerificationResponse {
  id: string;
  businessId: string;
  businessName?: string;
  ownerName?: string;
  ownerEmail?: string;
  category?: string;
  phone?: string;
  location?: string;
  tradeLicenseNo?: string;
  trustScore?: number;
  status: TVerificationStatus;
  submittedAt?: string;
  documents?: IVerificationDocument[];
}

export interface IVerificationFilters {
  status?: TVerificationStatus;
  page?: number;
  limit?: number;
  search?: string;
}

const buildQuery = (filters: IVerificationFilters): string => {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  const query = params.toString();
  return query ? `?${query}` : "";
};

// ============================================================
// NORMALIZE — backend nested object → flat UI shape
// ============================================================

const normalizeVerification = (raw: any): IVerificationResponse => {
  const business = raw.business || {};
  const owner = raw.business?.owner || raw.owner || {};

  return {
    id: raw.id,
    businessId: raw.businessId || business.id,

    businessName:
      raw.businessName ||
      business.name ||
      "Unknown Business",

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

    phone: raw.phone || business.contactPhone || business.phone,
    location:
      raw.location ||
      business.address?.city ||
      business.address?.district ||
      business.location,

    tradeLicenseNo:
      raw.tradeLicenseNo ||
      business.tradeLicenseNo ||
      business.tradeLicense ||
      "-",

    trustScore: raw.trustScore ?? business.trustScore ?? 0,

    status: raw.status || "PENDING",

    submittedAt: raw.submittedAt || raw.createdAt || raw.updatedAt,

    documents: Array.isArray(raw.documents)
      ? raw.documents.map((doc: any) => ({
          id: doc.id,
          documentType: doc.documentType || doc.document_type || "UNKNOWN",
          fileUrl: doc.fileUrl || doc.file_url || doc.url || "#",
          status: doc.status,
          uploadedAt: doc.uploadedAt || doc.uploaded_at || doc.createdAt,
        }))
      : [],
  };
};

// ============================================================
// GET /api/v1/verifications — List (MODERATOR, ADMIN)
// ============================================================

export const fetchVerifications = async (
  filters: IVerificationFilters = {}
): Promise<IVerificationResponse[]> => {
  const url = apiUrl(`/api/v1/verifications${buildQuery(filters)}`);
  console.log("🔍 fetchVerifications URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    console.log("📥 fetchVerifications status:", response.status);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("❌ fetchVerifications error:", response.status, errorText);
      return [];
    }

    const json = await response.json();
    console.log("📥 fetchVerifications raw:", json);

    let rawArray: any[] = [];
    if (Array.isArray(json)) rawArray = json;
    else if (Array.isArray(json?.data)) rawArray = json.data;
    else if (Array.isArray(json?.verifications)) rawArray = json.verifications;
    else if (Array.isArray(json?.data?.verifications)) rawArray = json.data.verifications;

    const normalized = rawArray.map(normalizeVerification);
    console.log("✅ fetchVerifications normalized:", normalized);
    return normalized;
  } catch (error) {
    console.error("❌ fetchVerifications exception:", error);
    return [];
  }
};

// ============================================================
// GET /api/v1/verifications/:id — Detail
// ============================================================

export const fetchVerificationById = async (
  id: string
): Promise<IVerificationResponse | null> => {
  try {
    const response = await fetch(apiUrl(`/api/v1/verifications/${id}`), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return null;

    const json = await response.json();
    const raw = json?.data ?? json;
    if (!raw) return null;

    return normalizeVerification(raw);
  } catch (error) {
    console.error("fetchVerificationById error:", error);
    return null;
  }
};

// ============================================================
// GET /api/v1/businesses/:id/documents — List business documents
// ============================================================

export const fetchBusinessDocuments = async (
  businessId: string
): Promise<IVerificationDocument[]> => {
  try {
    const response = await fetch(
      apiUrl(`/api/v1/businesses/${businessId}/documents`),
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    if (!response.ok) return [];

    const json = await response.json();
    let rawArray: any[] = [];
    if (Array.isArray(json)) rawArray = json;
    else if (Array.isArray(json?.data)) rawArray = json.data;
    else if (Array.isArray(json?.documents)) rawArray = json.documents;

    return rawArray.map((doc: any) => ({
      id: doc.id,
      documentType: doc.documentType || doc.document_type || "UNKNOWN",
      fileUrl: doc.fileUrl || doc.file_url || doc.url || "#",
      status: doc.status,
      uploadedAt: doc.uploadedAt || doc.uploaded_at || doc.createdAt,
    }));
  } catch (error) {
    console.error("fetchBusinessDocuments error:", error);
    return [];
  }
};