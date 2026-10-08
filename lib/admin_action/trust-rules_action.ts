// Previous implementation by: Existing Developer
// Kept for reference because Server Action cannot send cross-origin cookies.
//
// "use server";
// import { deleteMutation, patchMutation, postMutation } from "../core/mutations";
// export const createTrustRule = async (payload) => {
//   return await postMutation("/api/v1/trust-rules", payload);
// };

// Updated implementation for: Trust Rules page (Admin)
// Client-side fetch — cookie automatic goes via credentials: "include".
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";
import { TTrustRuleStatus } from "../admin_api/get-trust-rules";

export interface ICreateTrustRulePayload {
  ruleKey: string;
  label: string;
  points: number;
  isActive?: boolean;
  status: TTrustRuleStatus;
}

export interface IUpdateTrustRulePayload {
  label?: string;
  points?: number;
  isActive?: boolean;
  status?: TTrustRuleStatus;
}

// ============================================================
// POST /api/v1/trust-rules — Create trust rule (ADMIN)
// ============================================================

export const createTrustRule = async (payload: ICreateTrustRulePayload) => {
  console.log("🟢 createTrustRule payload:", payload);

  try {
    const res = await fetch(apiUrl("/api/v1/trust-rules"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",   // ← Cookie automatic
      cache: "no-store",
    });

    console.log("📥 createTrustRule status:", res.status);

    if (!res.ok) {
      const rawText = await res.text().catch(() => "");
      console.error("❌ createTrustRule failed:", res.status, rawText);
      return { error: true, status: res.status, message: rawText };
    }

    const data = await res.json();
    console.log("✅ createTrustRule success:", data);
    return data;
  } catch (err) {
    console.error("❌ createTrustRule exception:", err);
    return { error: true, message: "Server connection failed!" };
  }
};

// ============================================================
// PATCH /api/v1/trust-rules/:id — Update trust rule (ADMIN)
// ============================================================

export const updateTrustRule = async (
  id: string,
  payload: IUpdateTrustRulePayload
) => {
  console.log("🟡 updateTrustRule:", id, payload);

  try {
    const res = await fetch(apiUrl(`/api/v1/trust-rules/${id}`), {
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
    console.log("✅ updateTrustRule success:", data);
    return data;
  } catch (error) {
    console.error("❌ updateTrustRule error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// ============================================================
// DELETE /api/v1/trust-rules/:id — Delete trust rule (ADMIN)
// ============================================================

export const deleteTrustRule = async (id: string) => {
  console.log("🔴 deleteTrustRule:", id);

  try {
    const res = await fetch(apiUrl(`/api/v1/trust-rules/${id}`), {
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
    console.log("✅ deleteTrustRule success:", data);
    return data;
  } catch (error) {
    console.error("❌ deleteTrustRule error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};