// Previous implementation by: Unknown/Existing Developer
// Kept for reference because Server Action cannot send cross-origin cookies.
//
// import { deleteMutation, patchMutation, postMutation } from "../core/mutations";
// export const createCategory = async (payload) => {
//   return await postMutation("/api/v1/categories", payload);
// };

// Updated implementation for: Categories page (Admin)
// Client-side fetch sends session cookie automatically via credentials: "include".
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";

export interface ICreateCategoryPayload {
  name: string;
  iconUrl?: string;
  isActive?: boolean;
}

export interface IUpdateCategoryPayload {
  name?: string;
  iconUrl?: string;
  isActive?: boolean;
}

export const createCategory = async (payload: ICreateCategoryPayload) => {
  console.log("🟢 createCategory payload:", payload);

  try {
    const res = await fetch(apiUrl("/api/v1/categories"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",   // ← Cookie automatic (browser)
      cache: "no-store",
    });

    console.log("📥 createCategory status:", res.status);

    if (!res.ok) {
      const rawText = await res.text().catch(() => "");
      console.error("❌ createCategory failed:", res.status, rawText);
      return { error: true, status: res.status, message: rawText };
    }

    const data = await res.json();
    console.log("✅ createCategory success:", data);
    return data;
  } catch (err) {
    console.error("❌ createCategory exception:", err);
    return { error: true, message: "Server connection failed!" };
  }
};

export const updateCategory = async (
  id: string,
  payload: IUpdateCategoryPayload
) => {
  console.log("🟡 updateCategory:", id, payload);

  try {
    const res = await fetch(apiUrl(`/api/v1/categories/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${res.status}`
      );
    }

    const data = await res.json();
    console.log("✅ updateCategory success:", data);
    return data;
  } catch (error) {
    console.error("❌ updateCategory error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const deleteCategory = async (id: string) => {
  console.log("🔴 deleteCategory:", id);

  try {
    const res = await fetch(apiUrl(`/api/v1/categories/${id}`), {
      method: "DELETE",
      credentials: "include",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${res.status}`
      );
    }

    const data = await res.json();
    console.log("✅ deleteCategory success:", data);
    return data;
  } catch (error) {
    console.error("❌ deleteCategory error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};