"use server";

import { getData } from "../core/mutations";


// ============================================================
// RESPONSE TYPE (matches backend)
// ============================================================

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
  const response = await getData(`/api/v1/reports/me${query}`);

  if (response?.error || response?.success === false) {
    console.error("fetchMyReports error:", response);
    return [];
  }

  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.reports)) return response.reports;

  console.warn("Unexpected response shape:", response);
  return [];
};