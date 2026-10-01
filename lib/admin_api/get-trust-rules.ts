"use server";

import { getData } from "../core/mutations";



// ============================================================
// BACKEND RESPONSE TYPE
// ============================================================

export type TTrustRuleStatus = "VERIFICATION" | "ACTIVITY" | "REPORT";

export interface ITrustRuleResponse {
  id: string;
  ruleKey: string;
  label: string;
  points: number;
  isActive: boolean;
  status: TTrustRuleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ITrustRuleFilters {
  isActive?: boolean;
  status?: TTrustRuleStatus;
}

// ============================================================
// BUILD QUERY STRING
// ============================================================

const buildQuery = (filters: ITrustRuleFilters): string => {
  const params = new URLSearchParams();

  if (filters.isActive !== undefined)
    params.set("isActive", String(filters.isActive));
  if (filters.status)
    params.set("status", filters.status);

  const query = params.toString();
  return query ? `?${query}` : "";
};

// ============================================================
// GET /api/v1/trust-rules  — List trust rules
// ============================================================

export const fetchTrustRules = async (
  filters: ITrustRuleFilters = {}
): Promise<ITrustRuleResponse[]> => {
  const response = await getData(
    `/api/v1/trust-rules${buildQuery(filters)}`
  );

  if (response?.error || response?.success === false) {
    console.error("fetchTrustRules error:", response);
    return [];
  }

  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.rules)) return response.rules;

  console.warn("Unexpected response shape:", response);
  return [];
};