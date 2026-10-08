// src/lib/admin_api/get-trust-rules.ts
"use server";

import { getData } from "../core/mutations";

export type TTrustRuleStatus = "ACTIVE" | "INACTIVE";

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

const buildQuery = (filters: ITrustRuleFilters): string => {
  const params = new URLSearchParams();
  if (filters.isActive !== undefined)
    params.set("isActive", String(filters.isActive));
  if (filters.status) params.set("status", filters.status);
  const query = params.toString();
  return query ? `?${query}` : "";
};

export const fetchTrustRules = async (
  filters: ITrustRuleFilters = {}
): Promise<ITrustRuleResponse[]> => {
  const url = `/api/v1/trust-rules${buildQuery(filters)}`;
  console.log("🔍 Fetching:", url);

  const response = await getData(url);
  console.log("📥 fetchTrustRules response:", JSON.stringify(response, null, 2));

  if (response?.error || response?.success === false) {
    console.error("❌ fetchTrustRules error:", response);
    return [];
  }

  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.rules)) return response.rules;

  console.warn("⚠️ Unexpected response shape:", response);
  return [];
};