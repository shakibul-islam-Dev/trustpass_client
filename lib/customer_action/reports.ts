// Browser-side report API.
//
// This file must NOT be a "use server" module: POST /api/v1/reports requires
// the user's session cookie, and the cookie belongs to the API's host
// (localhost:5000 in dev). Only a fetch running in the browser can attach it
// via `credentials: "include"` — a server action cannot forward it.
//
// API: POST /api/v1/reports  (auth: CUSTOMER, SELLER)

import { apiUrl } from "@/lib/core/api-url";

// ============================================================
// BACKEND INTERFACES (match with backend)
// ============================================================

export type TReportReason =
  | "SPAM"
  | "INAPPROPRIATE_CONTENT"
  | "HARASSMENT"
  | "FRAUD"
  | "OTHER";

export type TReportStatus = "PENDING" | "REVIEWED" | "RESOLVED" | "REJECTED";

export interface ICreateReportPayload {
  businessId: string;
  reason: TReportReason;
  title?: string;
  description: string;
  evidenceUrls?: string[];
}

export interface IUpdateReportStatusPayload {
  status: "REVIEWED" | "RESOLVED" | "REJECTED";
  adminNote?: string;
  actionTaken?: string;
  penaltyPoints?: number;
}

// ============================================================
// API CALL
// ============================================================

/**
 * Submits a new report.
 * API: POST /api/v1/reports
 *
 * Returns the server envelope on success, or `{ error: true, status }` on
 * failure — the same shape the report modal already checks.
 */
export const submitReport = async (payload: ICreateReportPayload) => {
  try {
    const response = await fetch(apiUrl("/api/v1/reports"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("Report submission failed:", response.status, await response.text());
      return { error: true, status: response.status };
    }

    return await response.json();
  } catch (error) {
    console.error("Report submission exception:", error);
    return { error: true };
  }
};