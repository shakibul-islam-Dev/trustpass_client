// Updated implementation for: Reports page (Admin)
// Client-side fetch — cookie automatic goes via credentials: "include".
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";
import type { TReportStatus } from "../admin_api/get-reports";

export interface IUpdateReportStatusPayload {
  status: TReportStatus;
  adminNote?: string;
  actionTaken?: string;
  penaltyPoints?: number;
}

// ============================================================
// PATCH /api/v1/reports/:id/status — Update report status
// ============================================================

export const updateReportStatus = async (
  reportId: string,
  payload: IUpdateReportStatusPayload
) => {
  console.log("🟡 updateReportStatus:", reportId, payload);

  try {
    const res = await fetch(
      apiUrl(`/api/v1/reports/${reportId}/status`),
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
        cache: "no-store",
      }
    );

    console.log("📥 updateReportStatus status:", res.status);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("❌ updateReportStatus failed:", res.status, errorData);
      return {
        error: true,
        status: res.status,
        message: errorData.message || "Failed to update report status",
      };
    }

    const data = await res.json();
    console.log("✅ updateReportStatus success:", data);
    return data;
  } catch (error) {
    console.error("❌ updateReportStatus exception:", error);
    return {
      error: true,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};