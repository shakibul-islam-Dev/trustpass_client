// Updated implementation for: Business List actions (Admin)
// Client-side fetch — cookie automatic via credentials: "include".
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";

// ============================================================
// PATCH /api/v1/businesses/:id — Update business (e.g. featured)
// ============================================================

export const updateBusiness = async (
  businessId: string,
  payload: { isFeatured?: boolean }
) => {
  console.log("🟡 updateBusiness:", businessId, payload);

  try {
    const res = await fetch(apiUrl(`/api/v1/businesses/${businessId}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
      cache: "no-store",
    });

    console.log("📥 updateBusiness status:", res.status);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("❌ updateBusiness failed:", res.status, errorData);
      return {
        error: true,
        status: res.status,
        message: errorData.message || "Failed to update business",
      };
    }

    return await res.json();
  } catch (error) {
    console.error("❌ updateBusiness exception:", error);
    return {
      error: true,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// ============================================================
// DELETE /api/v1/businesses/:id — Delete business (ADMIN)
// ============================================================

export const deleteBusiness = async (businessId: string) => {
  console.log("🔴 deleteBusiness:", businessId);

  try {
    const res = await fetch(apiUrl(`/api/v1/businesses/${businessId}`), {
      method: "DELETE",
      credentials: "include",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        error: true,
        status: res.status,
        message: errorData.message || "Failed to delete business",
      };
    }

    return await res.json();
  } catch (error) {
    console.error("❌ deleteBusiness exception:", error);
    return {
      error: true,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};