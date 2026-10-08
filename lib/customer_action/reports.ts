// Previous implementation by: Existing Developer
// Kept for reference because Server Action cannot send cross-origin cookies.
//
// "use server";
// import { postMutation } from "../core/mutations";
// export const submitReport = async (payload) => {
//   return await postMutation("/api/v1/reports", payload);
// };

// Updated implementation for: Report Submission (Customer)
// Backend expects multipart/form-data with a `file` field (see Postman).
// Client-side fetch — cookie automatic goes via credentials: "include".
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";

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
    // Build multipart/form-data — this is what the backend expects
    // (confirmed via Postman: form-data with `file`, `businessId`, `reason`,
    //  `title`, `description`).
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
      body: formData,   // ← NOT JSON.stringify — send FormData directly
      credentials: "include",
      cache: "no-store",
      // ⚠️ Do NOT set Content-Type manually.
      // Browser will set it with the correct multipart boundary.
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