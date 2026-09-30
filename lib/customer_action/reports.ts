"use server";

import { postMutation } from "../core/mutations";



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
 */
export const submitReport = async (payload: ICreateReportPayload) => {
  return await postMutation("/api/v1/reports", payload);
};