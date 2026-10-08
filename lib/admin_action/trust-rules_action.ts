// src/lib/admin_action/trust-rules_action.ts
"use server";

import { TTrustRuleStatus } from "../admin_api/get-trust-rules";
import { deleteMutation, patchMutation, postMutation } from "../core/mutations";

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

export const createTrustRule = async (payload: ICreateTrustRulePayload) => {
  return await postMutation("/api/v1/trust-rules", payload);
};

export const updateTrustRule = async (
  id: string,
  payload: IUpdateTrustRulePayload
) => {
  return await patchMutation(`/api/v1/trust-rules/${id}`, payload);
};

export const deleteTrustRule = async (id: string) => {
  return await deleteMutation(`/api/v1/trust-rules/${id}`);
};