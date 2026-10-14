// Updated implementation for: User Management page (Admin)
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";
import { apiFetch } from "@/lib/core/api-fetch";
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
    const res = await apiFetch(apiUrl(`/api/v1/users/${userId}/role`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
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

// ============================================================
// 🆕 PATCH /api/v1/users/:id/status — Update user status (ADMIN)
// Body: { status: "ACTIVE" | "BLOCKED", reason?: string }
// ============================================================
export interface IUpdateStatusPayload {
  status: "ACTIVE" | "BLOCKED";
  reason?: string;
}

export const updateUserStatus = async (
  userId: string,
  payload: IUpdateStatusPayload
) => {
  console.log("🟡 updateUserStatus:", userId, payload);

  try {
    const res = await apiFetch(apiUrl(`/api/v1/users/${userId}/status`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
      cache: "no-store",
    });

    console.log("📥 updateUserStatus status:", res.status);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("❌ updateUserStatus failed:", res.status, errorData);
      return {
        error: true,
        status: res.status,
        message: errorData.message || "Failed to update status",
      };
    }

    const data = await res.json().catch(() => ({ success: true }));
    console.log("✅ updateUserStatus success:", data);
    return { success: true, ...data };
  } catch (error) {
    console.error("❌ updateUserStatus exception:", error);
    return {
      error: true,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// ============================================================
// 🆕 Helper — Toggle status (ACTIVE ↔ BLOCKED)
// ============================================================
export const toggleUserStatus = async (
  userId: string,
  currentStatus?: string
) => {
  const isCurrentlyBlocked =
    String(currentStatus).toUpperCase() === "BLOCKED";

  const newStatus: "ACTIVE" | "BLOCKED" = isCurrentlyBlocked
    ? "ACTIVE"
    : "BLOCKED";

  return updateUserStatus(userId, { status: newStatus });
};

// ============================================================
// DELETE /api/v1/users/:id — Delete user (ADMIN)
// ============================================================
export const deleteUser = async (userId: string) => {
  console.log("🔴 deleteUser:", userId);

  try {
    const res = await apiFetch(apiUrl(`/api/v1/users/${userId}`), {
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
        message: errorData.message || "Failed to delete user",
      };
    }

    const data = await res.json().catch(() => ({ success: true }));
    console.log("✅ deleteUser success:", data);
    return { success: true, ...data };
  } catch (error) {
    console.error("❌ deleteUser exception:", error);
    return {
      error: true,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};