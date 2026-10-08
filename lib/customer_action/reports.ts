// Previous implementation by: Existing Developer
// Kept for reference because Server Action cannot send cross-origin cookies.
//
// "use server";
// import { postMutation } from "../core/mutations";
// export const submitReport = async (payload) => {
//   return await postMutation("/api/v1/reports", payload);
// };

// Updated implementation for: Report Submission (Customer)
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
}

export interface IUpdateReportStatusPayload {
  status: "REVIEWED" | "RESOLVED" | "REJECTED";
  adminNote?: string;
  actionTaken?: string;
  penaltyPoints?: number;
}

// ============================================================
// POST /api/v1/reports — Submit report
// ============================================================

export const submitReport = async (payload: ICreateReportPayload) => {
  console.log("🟢 submitReport payload:", payload);

  try {
    const res = await fetch(apiUrl("/api/v1/reports"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",   // ← Cookie automatic
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