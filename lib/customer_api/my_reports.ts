// Previous implementation by: Existing Developer
// Kept for reference because Server Action cannot send cross-origin cookies.
//
// "use server";
// import { getData } from "../core/mutations";
// export const fetchMyReports = async (query) => {
//   const response = await getData(`/api/v1/reports/me${query}`);
//   // ...
// };

// Updated implementation for: Customer My Reports page
// Client-side fetch + response normalization.
// Backend returns nested objects (business.name, reporter.name),
// but UI expects flat fields (businessName, customerName).
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";

export interface IReportResponse {
  id: string;
  businessId: string;
  businessName?: string;
  customerId?: string;
  customerName?: string;
  reason: "SPAM" | "INAPPROPRIATE_CONTENT" | "HARASSMENT" | "FRAUD" | "OTHER";
  title?: string;
  description: string;
  evidenceUrls?: string[];
  status: "PENDING" | "REVIEWED" | "RESOLVED" | "REJECTED";
  adminNote?: string;
  actionTaken?: string;
  penaltyPoints?: number;
  createdAt: string;
  updatedAt?: string;
}

// ============================================================
// NORMALIZE — backend nested object → flat UI shape
// ============================================================

const normalizeReport = (raw: any): IReportResponse => ({
  id: raw.id,
  businessId: raw.businessId,
  businessName:
    raw.businessName ||
    raw.business?.name ||
    "Unknown Business",

  customerId: raw.customerId || raw.reporterId,
  customerName:
    raw.customerName ||
    raw.reporter?.name ||
    "Unknown Customer",

  reason: raw.reason,
  title: raw.title,
  description: raw.description,
  evidenceUrls: raw.evidenceUrls ?? [],
  status: raw.status,
  adminNote: raw.adminNote,
  actionTaken: raw.actionTaken,
  penaltyPoints: raw.penaltyPoints,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

// ============================================================
// GET /api/v1/reports/me — List own reports
// ============================================================

export const fetchMyReports = async (
  query = ""
): Promise<IReportResponse[]> => {
  const url = apiUrl(`/api/v1/reports/me${query}`);
  console.log("🔍 fetchMyReports URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    console.log("📥 fetchMyReports status:", response.status);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("❌ fetchMyReports error:", response.status, errorText);
      return [];
    }

    const json = await response.json();
    console.log("📥 fetchMyReports raw data:", json);

    let rawArray: any[] = [];
    if (Array.isArray(json)) rawArray = json;
    else if (Array.isArray(json?.data)) rawArray = json.data;
    else if (Array.isArray(json?.reports)) rawArray = json.reports;
    else if (Array.isArray(json?.data?.reports)) rawArray = json.data.reports;
    else {
      console.warn("⚠️ Unexpected response shape:", json);
      return [];
    }

    const normalized = rawArray.map(normalizeReport);
    console.log("✅ fetchMyReports normalized:", normalized);

    return normalized;
  } catch (error) {
    console.error("❌ fetchMyReports exception:", error);
    return [];
  }
};