"use server";

import { getData } from "../core/mutations";

// ============================================================
// BACKEND RESPONSE TYPES
// ============================================================

/**
 * Matches the backend's report response shape.
 * TODO: Adjust field names after confirming with backend developer.
 */
export interface IReportResponse {
  id: string;
  businessId: string;
  businessName?: string;
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
// GET /api/v1/reports/me  — List own reports
// ============================================================

/**
 * Fetches all reports submitted by the current customer.
 * API: GET /api/v1/reports/me
 *
 * @param query - Optional query string, e.g. "?page=1&limit=20&status=PENDING"
 */
export const fetchMyReports = async (query = ""): Promise<IReportResponse[]> => {
  const response = await getData(`/api/v1/reports/me${query}`);

  // Handle error from getData()
  if (response?.error || response?.success === false) {
    console.error("fetchMyReports error:", response);
    return [];
  }

  // Handle different response shapes from backend
  // Case 1: Backend returns array directly
  if (Array.isArray(response)) return response;

  // Case 2: Backend returns { data: [...] }
  if (Array.isArray(response?.data)) return response.data;

  // Case 3: Backend returns { reports: [...] }
  if (Array.isArray(response?.reports)) return response.reports;

  // Fallback: no data
  console.warn("Unexpected response shape:", response);
  return [];
};