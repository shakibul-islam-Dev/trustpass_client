"use server";

import { deleteMutation, patchMutation, postMutation } from "../core/mutations";



// ============================================================
// BACKEND INTERFACES (match with backend)
// ============================================================

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

// ============================================================
// POST /api/v1/categories  — Create category (ADMIN)
// ============================================================

export const createCategory = async (payload: ICreateCategoryPayload) => {
  return await postMutation("/api/v1/categories", payload);
};

// ============================================================
// PATCH /api/v1/categories/:id  — Update category (ADMIN)
// ============================================================

export const updateCategory = async (
  id: string,
  payload: IUpdateCategoryPayload
) => {
  return await patchMutation(`/api/v1/categories/${id}`, payload);
};

// ============================================================
// DELETE /api/v1/categories/:id  — Delete category (ADMIN)
// ============================================================

export const deleteCategory = async (id: string) => {
  return await deleteMutation(`/api/v1/categories/${id}`);
};