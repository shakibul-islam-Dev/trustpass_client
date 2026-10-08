// Previous implementation by: Existing Developer
// Kept for reference because Server Action cannot send cross-origin cookies.
//
// "use server";
// import { getData } from "../core/mutations";
// export const fetchTrustRules = async () => {
//   const response = await getData("/api/v1/trust-rules");
//   // ...
// };

// Updated implementation for: Trust Rules page (Admin)
// Client-side fetch — cookie automatic goes via credentials: "include".
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";


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
  const url = apiUrl(`/api/v1/trust-rules${buildQuery(filters)}`);
  console.log("🔍 fetchTrustRules URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",   // ← Cookie automatic (browser)
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    console.log("📥 fetchTrustRules status:", response.status);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("❌ fetchTrustRules error:", response.status, errorText);
      return [];
    }

    const data = await response.json();
    console.log("📥 fetchTrustRules data:", data);

    // Handle different response shapes
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.rules)) return data.rules;

    console.warn("⚠️ Unexpected response shape:", data);
    return [];
  } catch (error) {
    console.error("❌ fetchTrustRules exception:", error);
    return [];
  }
};