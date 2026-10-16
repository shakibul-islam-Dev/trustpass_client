/**
 * Seller plan (tier) helpers.
 *
 * The server has no subscription record yet — the only paid product is a
 * per-listing bKash purchase (`PaymentPurpose.PRODUCT_SLOT`). Until a real
 * subscription exists, a seller is treated as PRO once at least one payment
 * for their account has succeeded, and FREE otherwise. That keeps the UI
 * honest: "Pro" is shown only when money actually changed hands.
 */

import { apiFetch } from "@/lib/core/api-fetch";
import { apiUrl } from "@/lib/core/api-url";
import { getMyPayments, type PaymentRecord } from "@/lib/core/bkash-api";

/** Products a FREE seller can publish before paying. Mirrors the server. */
export const FREE_PRODUCT_LIMIT = 5;

/** Price of one extra listing slot, in BDT (server default). */
export const PRO_LISTING_FEE_BDT = 500;

export type SellerTier = "FREE" | "PRO";

/** PRO when the seller has at least one successful payment, else FREE. */
export function deriveTier(payments: PaymentRecord[] | null | undefined): SellerTier {
  if (!payments || payments.length === 0) return "FREE";
  return payments.some((payment) => payment.status === "SUCCESS") ? "PRO" : "FREE";
}

/** Reads the seller's payment history and collapses it to a tier. */
export async function getSellerTier(): Promise<SellerTier> {
  const result = await getMyPayments();
  if (!result.ok || !result.data) return "FREE";
  return deriveTier(result.data);
}

/** Shape returned by `GET /api/v1/payments/quota` (server `IProductListingQuota`). */
export interface ProductQuota {
  freeLimit: number;
  currentProductCount: number;
  freeSlotsRemaining: number;
  paidSlotsAvailable: number;
  canAddProduct: boolean;
  requiresPayment: boolean;
  listingFeePerProduct: number;
  currency: string;
}

/**
 * Exact listing quota for one business. Returns null on any failure so the UI
 * can fall back to the simple FREE-limit rule instead of showing an error.
 */
export async function getProductQuota(
  businessId: string,
): Promise<ProductQuota | null> {
  if (!businessId) return null;
  try {
    const response = await apiFetch(
      apiUrl(`/api/v1/payments/quota?businessId=${encodeURIComponent(businessId)}`),
      { method: "GET", credentials: "include" },
    );
    const body = (await response.json().catch(() => null)) as
      | { success?: boolean; data?: ProductQuota }
      | null;
    if (!response.ok || !body?.success || !body.data) return null;
    return body.data;
  } catch {
    return null;
  }
}
