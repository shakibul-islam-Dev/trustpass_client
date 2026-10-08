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
// Client-side fetch — cookie automatic goes via credentials: "include".
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

    const data = await response.json();
    console.log("📥 fetchMyReports data:", data);

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.reports)) return data.reports;

    console.warn("⚠️ Unexpected response shape:", data);
    return [];
  } catch (error) {
    console.error("❌ fetchMyReports exception:", error);
    return [];
  }
};