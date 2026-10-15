// Updated implementation for: Business Documents actions (Admin/Moderator)
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";
import { apiFetch } from "@/lib/core/api-fetch";

export interface IReviewDocumentPayload {
  ruleKey: string;
  status: "APPROVED" | "REJECTED" | "PENDING";
  rejectionReason?: string;
}

// ============================================================
// PATCH /api/v1/documents/:id/review
// Body: { ruleKey: "tin_certificate", status: "APPROVED" }
// ============================================================
export const reviewDocument = async (
  documentId: string,
  payload: IReviewDocumentPayload
) => {
  console.log("🟡 reviewDocument:", documentId, payload);

  try {
    const res = await apiFetch(
      apiUrl(`/api/v1/documents/${documentId}/review`),
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
        cache: "no-store",
      }
    );

    console.log("📥 reviewDocument status:", res.status);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("❌ reviewDocument failed:", res.status, errorData);
      return {
        error: true,
        status: res.status,
        message: errorData.message || "Failed to review document",
      };
    }

    const data = await res.json().catch(() => ({ success: true }));
    console.log("✅ reviewDocument success:", data);
    return { success: true, ...data };
  } catch (error) {
    console.error("❌ reviewDocument exception:", error);
    return {
      error: true,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// ============================================================
// GET /api/v1/documents/:id
// ============================================================
export const fetchDocumentById = async (documentId: string) => {
  try {
    const res = await apiFetch(apiUrl(`/api/v1/documents/${documentId}`), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? json;
  } catch (error) {
    console.error("fetchDocumentById error:", error);
    return null;
  }
};

// ============================================================
// DELETE /api/v1/documents/:id
// ============================================================
export const deleteDocument = async (documentId: string) => {
  try {
    const res = await apiFetch(apiUrl(`/api/v1/documents/${documentId}`), {
      method: "DELETE",
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      return { error: true, status: res.status };
    }

    return { success: true };
  } catch (error) {
    return { error: true, message: "Unknown error" };
  }
};