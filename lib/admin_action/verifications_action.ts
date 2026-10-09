// Updated implementation for: Business Verifications actions (Admin/Moderator)
// Client-side fetch — cookie automatic goes via credentials: "include".
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";

export interface IReviewVerificationPayload {
  status: "APPROVED" | "REJECTED" | "UNDER_REVIEW";
  adminNote?: string;
}

// ============================================================
// PATCH /api/v1/verifications/:id/review — Approve / Reject
// ============================================================

export const reviewVerification = async (
  id: string,
  payload: IReviewVerificationPayload
) => {
  console.log("🟡 reviewVerification:", id, payload);

  try {
    const res = await fetch(apiUrl(`/api/v1/verifications/${id}/review`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
      cache: "no-store",
    });

    console.log("📥 reviewVerification status:", res.status);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("❌ reviewVerification failed:", res.status, errorData);
      return {
        error: true,
        status: res.status,
        message: errorData.message || "Failed to review",
      };
    }

    const data = await res.json();
    console.log("✅ reviewVerification success:", data);
    return data;
  } catch (error) {
    console.error("❌ reviewVerification exception:", error);
    return {
      error: true,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};