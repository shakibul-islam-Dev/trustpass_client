// Updated implementation for: Business actions (Admin)
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";
import { apiFetch } from "@/lib/core/api-fetch";

// ============================================================
// PATCH /api/v1/businesses/:id
// ============================================================
export const updateBusiness = async (
  businessId: string,
  payload: { isFeatured?: boolean }
) => {
  console.log("🟡 updateBusiness:", businessId, payload);

  try {
    const res = await apiFetch(apiUrl(`/api/v1/businesses/${businessId}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        error: true,
        status: res.status,
        message: errorData.message || "Failed to update business",
      };
    }

    return await res.json();
  } catch (error) {
    return {
      error: true,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// ============================================================
// DELETE /api/v1/businesses/:id  (SELLER, ADMIN)
// ============================================================
export const deleteBusiness = async (businessId: string) => {
  console.log("🔴 deleteBusiness called:", businessId);

  try {
    const url = apiUrl(`/api/v1/businesses/${businessId}`);
    console.log("🔴 DELETE URL:", url);

    const res = await apiFetch(url, {
      method: "DELETE",
      credentials: "include",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });

    console.log("📥 DELETE status:", res.status, "ok:", res.ok);

    // ❌ Error
    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      console.error("❌ DELETE RAW error:", res.status, errorText);

      let message = `Failed to delete (${res.status})`;
      try {
        const parsed = JSON.parse(errorText);
        message = parsed.message || parsed.error || message;
      } catch {
        if (errorText) message = errorText;
      }

      return { error: true, status: res.status, message };
    }

    // ✅ 204 No Content (common for DELETE)
    if (res.status === 204) {
      console.log("✅ Delete success — 204");
      return { success: true };
    }

    // ✅ 200 with/without body
    const text = await res.text();
    if (!text) {
      console.log("✅ Delete success — empty body");
      return { success: true };
    }

    try {
      const data = JSON.parse(text);
      console.log("✅ Delete success:", data);
      return { success: true, ...data };
    } catch {
      return { success: true };
    }
  } catch (error) {
    console.error("❌ deleteBusiness exception:", error);
    return {
      error: true,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};