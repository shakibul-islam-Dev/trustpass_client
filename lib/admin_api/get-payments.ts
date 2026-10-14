// Updated implementation for: Admin Payments List
// Client-side fetch + response normalization.
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";
import { apiFetch } from "@/lib/core/api-fetch";

// ============================================================
// Types
// ============================================================
export interface IPaymentResponse {
  id: string;

  // User (payer)
  userId: string;
  userName?: string | null;
  userEmail?: string | null;

  // Business
  businessId?: string | null;
  businessName?: string | null;
  businessSlug?: string | null;

  // Core
  purpose?: string | null;
  amount: number;
  currency: string;
  status: string;

  // bKash
  bkashTrxId?: string | null;
  bkashPaymentId?: string | null;
  bkashExecuteTime?: string | null;
  merchantInvoiceNumber?: string | null;

  // Payer details (from bkashRawResponse)
  payerAccount?: string | null;
  payerReference?: string | null;

  // Meta
  slotsUnlocked?: number | null;

  // Timestamps
  createdAt: string;
  updatedAt?: string;
}

export interface IPaymentFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

const buildQuery = (filters: IPaymentFilters): string => {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  const q = params.toString();
  return q ? `?${q}` : "";
};

// ============================================================
// Normalize — backend → flat UI
// ============================================================
const normalizePayment = (raw: any): IPaymentResponse => {
  const user = raw.user ?? {};
  const business = raw.business ?? {};
  const bkash = raw.bkashRawResponse ?? {};

  return {
    id: raw.id,

    // User
    userId: raw.userId ?? raw.user_id ?? user.id ?? "",
    userName: raw.userName ?? user.name ?? null,
    userEmail: raw.userEmail ?? user.email ?? null,

    // Business
    businessId: raw.businessId ?? raw.business_id ?? business.id ?? null,
    businessName: raw.businessName ?? business.name ?? null,
    businessSlug: raw.businessSlug ?? business.slug ?? null,

    // Core
    purpose: raw.purpose ?? null,
    amount: Number(raw.amount ?? 0),
    currency: raw.currency ?? "BDT",
    status: String(raw.status ?? "PENDING").toUpperCase(),

    // bKash
    bkashTrxId: raw.bkashTrxId ?? raw.bkash_trx_id ?? bkash.trxID ?? null,
    bkashPaymentId:
      raw.bkashPaymentId ?? raw.bkash_payment_id ?? bkash.paymentID ?? null,
    bkashExecuteTime:
      raw.bkashExecuteTime ??
      raw.bkash_execute_time ??
      bkash.paymentExecuteTime ??
      null,
    merchantInvoiceNumber:
      raw.merchantInvoiceNumber ??
      raw.merchant_invoice_number ??
      bkash.merchantInvoiceNumber ??
      null,

    // Payer details
    payerAccount:
      raw.payerAccount ?? bkash.payerAccount ?? bkash.customerMsisdn ?? null,
    payerReference: raw.payerReference ?? bkash.payerReference ?? null,

    // Meta
    slotsUnlocked: raw.slotsUnlocked ?? raw.slots_unlocked ?? null,

    // Timestamps
    createdAt: raw.createdAt ?? raw.created_at ?? "",
    updatedAt: raw.updatedAt ?? raw.updated_at,
  };
};

// ============================================================
// GET /api/v1/payments/admin/all — List all (ADMIN, MODERATOR)
// ============================================================
export const fetchAllPayments = async (
  filters: IPaymentFilters = {}
): Promise<IPaymentResponse[]> => {
  const url = apiUrl(`/api/v1/payments/admin/all${buildQuery(filters)}`);
  console.log("🔍 fetchAllPayments URL:", url);

  try {
    const response = await apiFetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    console.log("📥 fetchAllPayments status:", response.status);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("❌ fetchAllPayments error:", response.status, errorText);
      return [];
    }

    const json = await response.json();
    console.log("📥 fetchAllPayments raw:", json);

    let rawArray: any[] = [];
    if (Array.isArray(json)) rawArray = json;
    else if (Array.isArray(json?.data)) rawArray = json.data;
    else if (Array.isArray(json?.payments)) rawArray = json.payments;
    else if (Array.isArray(json?.data?.payments))
      rawArray = json.data.payments;

    const normalized = rawArray.map(normalizePayment);
    console.log("✅ fetchAllPayments normalized:", normalized.length);
    return normalized;
  } catch (error) {
    console.error("❌ fetchAllPayments exception:", error);
    return [];
  }
};

// ============================================================
// GET /api/v1/payments/:id — Single (SELLER, ADMIN, MODERATOR)
// ============================================================
export const fetchPaymentById = async (
  id: string
): Promise<IPaymentResponse | null> => {
  try {
    const response = await apiFetch(apiUrl(`/api/v1/payments/${id}`), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) return null;

    const json = await response.json();
    const raw = json?.data ?? json;
    if (!raw) return null;

    return normalizePayment(raw);
  } catch (error) {
    console.error("fetchPaymentById error:", error);
    return null;
  }
};