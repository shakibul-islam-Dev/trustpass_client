// Previous implementation by: Existing Developer
// Kept for reference because Server Action cannot send cross-origin cookies.
//
// "use server";
// import { getData } from "../core/mutations";
// export const fetchReports = async () => {
//   const response = await getData("/api/v1/reports");
//   // ...
// };

// Updated implementation for: Reports page (Admin + Moderator)
// Client-side fetch + response normalization.
// Backend returns nested objects (business.name, reporter.name),
// but UI expects flat fields (businessName, customerName).
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";

export type TReportStatus = "PENDING" | "REVIEWED" | "RESOLVED" | "REJECTED";
export type TReportReason =
  | "SPAM"
  | "INAPPROPRIATE_CONTENT"
  | "HARASSMENT"
  | "FRAUD"
  | "OTHER";
export type TReportPriority = "LOW" | "MEDIUM" | "HIGH";

export interface IReportResponse {
  id: string;
  businessId: string;
  businessName?: string;
  customerId?: string;
  customerName?: string;
  reason: TReportReason;
  title?: string;
  description: string;
  evidenceUrls?: string[];
  status: TReportStatus;
  priority?: TReportPriority;
  adminNote?: string;
  actionTaken?: string;
  penaltyPoints?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface IReportFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: TReportStatus;
  priority?: TReportPriority;
}

const buildQuery = (filters: IReportFilters): string => {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  const query = params.toString();
  return query ? `?${query}` : "";
};

// ============================================================
// NORMALIZE — backend nested object → flat UI shape
// ============================================================

const normalizeReport = (raw: any): IReportResponse => ({
  id: raw.id,
  businessId: raw.businessId,
  businessName:
    raw.businessName ||          // if backend flattens
    raw.business?.name ||        // nested business.name
    "Unknown Business",

  customerId: raw.customerId || raw.reporterId,
  customerName:
    raw.customerName ||          // if backend flattens
    raw.reporter?.name ||        // nested reporter.name
    "Unknown Customer",

  reason: raw.reason,
  title: raw.title,
  description: raw.description,
  evidenceUrls: raw.evidenceUrls ?? [],
  status: raw.status,
  priority: raw.priority,
  adminNote: raw.adminNote,
  actionTaken: raw.actionTaken,
  penaltyPoints: raw.penaltyPoints,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

// ============================================================
// GET /api/v1/reports — List all reports (MODERATOR, ADMIN)
// ============================================================

export const fetchReports = async (
  filters: IReportFilters = {}
): Promise<IReportResponse[]> => {
  const url = apiUrl(`/api/v1/reports${buildQuery(filters)}`);
  console.log("🔍 fetchReports URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    console.log("📥 fetchReports status:", response.status);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("❌ fetchReports error:", response.status, errorText);
      return [];
    }

    const json = await response.json();
    console.log("📥 fetchReports raw data:", json);

    // Extract array from various response shapes
    let rawArray: any[] = [];
    if (Array.isArray(json)) rawArray = json;
    else if (Array.isArray(json?.data)) rawArray = json.data;
    else if (Array.isArray(json?.reports)) rawArray = json.reports;
    else if (Array.isArray(json?.data?.reports)) rawArray = json.data.reports;
    else {
      console.warn("⚠️ Unexpected response shape:", json);
      return [];
    }

    // Normalize each report
    const normalized = rawArray.map(normalizeReport);
    console.log("✅ fetchReports normalized:", normalized);

    return normalized;
  } catch (error) {
    console.error("❌ fetchReports exception:", error);
    return [];
  }
};

// ============================================================
// GET /api/v1/reports/:id — Get single report
// ============================================================

export const fetchReportById = async (
  id: string
): Promise<IReportResponse | null> => {
  try {
    const response = await fetch(apiUrl(`/api/v1/reports/${id}`), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) return null;

    const json = await response.json();
    const raw = json?.data ?? json;
    if (!raw) return null;

    return normalizeReport(raw);
  } catch (error) {
    console.error("fetchReportById error:", error);
    return null;
  }
};