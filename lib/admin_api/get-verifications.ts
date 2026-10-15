// Updated implementation for: Business Verifications (Admin/Moderator)
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";
import { apiFetch } from "@/lib/core/api-fetch";
import type {
  BusinessDocumentStatus,
  BusinessDocumentType,
  BusinessVerificationStatus,
} from "@/types/admin";

export type TVerificationStatus = BusinessVerificationStatus;

export interface IVerificationDocument {
  id: string;
  documentType: BusinessDocumentType | string;
  fileUrl: string;
  status?: BusinessDocumentStatus | string;
  rejectionReason?: string | null;
  uploadedAt?: string;
}

export interface IVerificationResponse {
  id: string;
  businessId: string;
  businessName?: string;
  businessSlug?: string;
  businessVerificationStatus?: string;

  // 🔑 Owner info (from business.owner)
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;

  status: TVerificationStatus;
  reviewedBy?: string | null;
  reviewedAt?: string;
  submittedAt?: string;

  trustScore?: number;
  trustScoreUpdatedAt?: string | null;
  documents: IVerificationDocument[];
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
  const q = params.toString();
  return q ? `?${q}` : "";
};

const normalizeDocument = (doc: any): IVerificationDocument => ({
  id: doc.id,
  documentType: doc.documentType || doc.document_type || "UNKNOWN",
  fileUrl: doc.fileUrl || doc.file_url || doc.url || "#",
  status: doc.status,
  rejectionReason: doc.rejectionReason ?? doc.rejection_reason ?? null,
  uploadedAt: doc.uploadedAt || doc.uploaded_at || doc.createdAt,
});

const normalizeVerification = (raw: any): IVerificationResponse => {
  const business = raw.business || {};
  const owner = business.owner || raw.owner || {};

  const rawDocs = Array.isArray(business.documents)
    ? business.documents
    : Array.isArray(raw.documents)
    ? raw.documents
    : [];

  return {
    id: raw.id,
    businessId: raw.businessId || business.id,
    businessName: raw.businessName || business.name || "Unknown Business",
    businessSlug: business.slug,
    businessVerificationStatus: business.verificationStatus,

    // 🔑 Owner info
    ownerId: raw.submittedBy || business.ownerId || owner.id,
    ownerName: owner.name || raw.ownerName || "-",
    ownerEmail: owner.email || raw.ownerEmail || "-",

    status: raw.status || "PENDING",
    reviewedBy: raw.reviewedBy,
    reviewedAt: raw.reviewedAt,
    submittedAt: raw.submittedAt || raw.createdAt,

    trustScore: raw.trustScore ?? business.trustScore ?? 0,
    trustScoreUpdatedAt:
      business.trustScoreUpdatedAt ?? raw.trustScoreUpdatedAt ?? null,
    documents: rawDocs.map(normalizeDocument),
  };
};

export const fetchVerifications = async (
  filters: IVerificationFilters = {}
): Promise<IVerificationResponse[]> => {
  const url = apiUrl(`/api/v1/verifications${buildQuery(filters)}`);
  console.log("🔍 fetchVerifications URL:", url);

  try {
    const response = await apiFetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.error("❌ fetchVerifications error:", response.status);
      return [];
    }

    const json = await response.json();

    let rawArray: any[] = [];
    if (Array.isArray(json)) rawArray = json;
    else if (Array.isArray(json?.data)) rawArray = json.data;
    else if (Array.isArray(json?.verifications)) rawArray = json.verifications;
    else if (Array.isArray(json?.data?.verifications))
      rawArray = json.data.verifications;

    const normalized = rawArray.map(normalizeVerification);
    console.log("✅ Normalized[0]:", normalized[0]);
    return normalized;
  } catch (error) {
    console.error("❌ fetchVerifications exception:", error);
    return [];
  }
};

export const fetchVerificationById = async (
  id: string
): Promise<IVerificationResponse | null> => {
  try {
    const response = await apiFetch(apiUrl(`/api/v1/verifications/${id}`), {
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

export const fetchBusinessDocuments = async (
  businessId: string
): Promise<IVerificationDocument[]> => {
  try {
    const response = await apiFetch(
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

    return rawArray.map(normalizeDocument);
  } catch (error) {
    console.error("fetchBusinessDocuments error:", error);
    return [];
  }
};