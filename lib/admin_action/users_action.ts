// Previous implementation by: Existing Developer
// Kept for reference because Server Action cannot send cross-origin cookies.
//
// "use server";
// import { patchMutation } from "../core/mutations";
// export const updateUserRole = async (userId, role) => {
//   return await patchMutation(`/api/v1/users/${userId}/role`, { role });
// };

// Updated implementation for: User Management page (Admin)
// Client-side fetch — cookie automatic goes via credentials: "include".
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";
import type { UserRole } from "@/types/admin";

// ============================================================
// PATCH /api/v1/users/:id/role — Update user role (ADMIN)
// ============================================================

export const updateUserRole = async (
  userId: string,
  role: UserRole
) => {
  console.log("🟢 updateUserRole:", userId, role);

  try {
    const res = await fetch(apiUrl(`/api/v1/users/${userId}/role`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),   // "CUSTOMER" | "SELLER" | "MODERATOR" | "ADMIN"
      credentials: "include",   // ← Cookie automatic
      cache: "no-store",
    });

    console.log("📥 updateUserRole status:", res.status);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("❌ updateUserRole failed:", res.status, errorData);
      return {
        error: true,
        status: res.status,
        message: errorData.message || "Failed to update role",
      };
    }

    const data = await res.json();
    console.log("✅ updateUserRole success:", data);
    return data;
  } catch (error) {
    console.error("❌ updateUserRole exception:", error);
    return {
      error: true,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};