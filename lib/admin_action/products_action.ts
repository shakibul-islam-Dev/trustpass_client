// Product actions — Admin panel
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";
import { apiFetch } from "@/lib/core/api-fetch";

// ============================================================
// DELETE /api/v1/products/:id
// ============================================================
export const deleteProduct = async (productId: string) => {
  console.log("🔴 deleteProduct:", productId);

  try {
    const res = await apiFetch(apiUrl(`/api/v1/products/${productId}`), {
      method: "DELETE",
      credentials: "include",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });

    console.log("📥 deleteProduct status:", res.status);

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      let message = `Failed to delete (${res.status})`;
      try {
        const parsed = JSON.parse(errorText);
        message = parsed.message || parsed.error || message;
      } catch {
        if (errorText) message = errorText;
      }
      return { error: true, status: res.status, message };
    }

    if (res.status === 204) return { success: true };

    const text = await res.text();
    if (!text) return { success: true };

    try {
      const data = JSON.parse(text);
      return { success: true, ...data };
    } catch {
      return { success: true };
    }
  } catch (error) {
    console.error("❌ deleteProduct exception:", error);
    return {
      error: true,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// ============================================================
// PATCH /api/v1/products/:id
// ============================================================
export const updateProduct = async (
  productId: string,
  payload: Partial<{
    name: string;
    description: string;
    price: number;
    stock: number;
    status: string;
  }>
) => {
  try {
    const res = await apiFetch(apiUrl(`/api/v1/products/${productId}`), {
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
        message: errorData.message || "Failed to update product",
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