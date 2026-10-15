// Updated implementation for: Trust Score actions (Admin/Moderator)
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";
import { apiFetch } from "@/lib/core/api-fetch";

export interface IRecalculateTrustScoreResult {
  error?: true;
  success?: true;
  status?: number;
  message?: string;
  /** The freshly computed score, taken from the API response. */
  score?: number;
}

/**
 * `POST /api/v1/trust-scores/business/:id/recalculate`
 *
 * Re-aggregates the business' awarded trust points and writes the result to
 * `business.trustScore` / `trustScoreUpdatedAt`. Restricted to
 * MODERATOR / ADMIN by the API.
 */
export const recalculateTrustScore = async (
  businessId: string,
): Promise<IRecalculateTrustScoreResult> => {
  try {
    const res = await apiFetch(
      apiUrl(`/api/v1/trust-scores/business/${businessId}/recalculate`),
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: { Accept: "application/json" },
      },
    );

    const json = await res.json().catch(() => ({}));

    if (!res.ok || json?.success === false) {
      return {
        error: true,
        status: res.status,
        message: json?.message || "Failed to recalculate trust score.",
      };
    }

    return {
      success: true,
      score: Number(json?.data),
      message: json?.message,
    };
  } catch (error) {
    return {
      error: true,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
