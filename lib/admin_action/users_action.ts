"use server";

import { patchMutation } from "../core/mutations";



export const updateUserRole = async (
  userId: string,
  role: string
) => {
  console.log("🟢 updateUserRole:", userId, role);

  const response = await patchMutation(`/api/v1/users/${userId}/role`, {
    role,   // "CUSTOMER" | "SELLER" | "MODERATOR" | "ADMIN"
  });

  console.log("📥 updateUserRole response:", JSON.stringify(response, null, 2));
  return response;
};