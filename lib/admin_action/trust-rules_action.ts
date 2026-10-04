"use server";

import { TTrustRuleStatus } from "../admin_api/get-trust-rules";
import { deleteMutation, patchMutation, postMutation } from "../core/mutations";



// ============================================================
// BACKEND INTERFACES
// ============================================================

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
// POST /api/v1/trust-rules  — Create trust rule (ADMIN)
// ============================================================

export const createTrustRule = async (payload: ICreateTrustRulePayload) => {
  return await postMutation("/api/v1/trust-rules", payload);
};

// ============================================================
// PATCH /api/v1/trust-rules/:id  — Update trust rule (ADMIN)
// ============================================================

export const updateTrustRule = async (
  id: string,
  payload: IUpdateTrustRulePayload
) => {
  return await patchMutation(`/api/v1/trust-rules/${id}`, payload);
};

// ============================================================
// DELETE /api/v1/trust-rules/:id  — Delete trust rule (ADMIN)
// ============================================================

export const deleteTrustRule = async (id: string) => {
  return await deleteMutation(`/api/v1/trust-rules/${id}`);
};