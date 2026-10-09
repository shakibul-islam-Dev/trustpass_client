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
  /** Optional: single image file to upload with the report */
  file?: File | null;
}

export interface IUpdateReportStatusPayload {
  status: "REVIEWED" | "RESOLVED" | "REJECTED";
  adminNote?: string;
  actionTaken?: string;
  penaltyPoints?: number;
}

// ============================================================
// POST /api/v1/reports — Submit report (with optional file)
// ============================================================

/**
 * Submits a new report.
 * API: POST /api/v1/reports
 *
 * Returns the server envelope on success, or `{ error: true, status, message }` on
 * failure — the same shape the report modal checks.
 */
export const submitReport = async (payload: ICreateReportPayload) => {
  console.log("🟢 submitReport payload:", {
    businessId: payload.businessId,
    reason: payload.reason,
    title: payload.title,
    description: payload.description,
    hasFile: !!payload.file,
    fileName: payload.file?.name,
  });

  try {
    const formData = new FormData();
    formData.append("businessId", payload.businessId);
    formData.append("reason", payload.reason);
    formData.append("description", payload.description);

    if (payload.title) {
      formData.append("title", payload.title);
    }

    if (payload.file) {
      formData.append("file", payload.file);
    }

    const res = await fetch(apiUrl("/api/v1/reports"), {
      method: "POST",
      body: formData,
      credentials: "include",
      cache: "no-store",
    });

    console.log("📥 submitReport status:", res.status);

    if (!res.ok) {
      const rawText = await res.text().catch(() => "");
      console.error("❌ submitReport failed:", res.status, rawText);
      return { error: true, status: res.status, message: rawText };
    }

    const data = await res.json();
    console.log("✅ submitReport success:", data);
    return data;
  } catch (err) {
    console.error("❌ submitReport exception:", err);
    return { error: true, message: "Server connection failed!" };
  }
};