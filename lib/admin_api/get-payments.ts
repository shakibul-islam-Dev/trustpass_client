// Updated implementation for: Admin Payments List
// Client-side fetch + response normalization.
// Developer: Aritro (Admin scope — not in Section 15's Shakibul scope).
//
// 🚧 TEMPORARY: `USE_DUMMY` flag below returns fake data while the backend
// `GET /api/v1/payments` endpoint is not deployed yet (currently 404).
// Once the backend endpoint is live, set `USE_DUMMY = false` and delete the
// `DUMMY_PAYMENTS` block. Nothing else needs to change.

import { apiUrl } from "@/lib/core/api-url";

// ============================================================
// 🚧 TEMPORARY FLAG — set to `false` when backend is ready
// ============================================================

const USE_DUMMY = true;

// ============================================================
// TYPES
// ============================================================

export interface IPaymentResponse {
  id: string;
  transactionId?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  businessId?: string;
  businessName?: string;
  amount: number;
  currency?: string;
  status: string;
  method?: string;
  gateway?: string;
  reference?: string;
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
  const query = params.toString();
  return query ? `?${query}` : "";
};

// ============================================================
// 🚧 TEMPORARY DUMMY DATA — delete when backend is ready
// ============================================================

const DUMMY_PAYMENTS: IPaymentResponse[] = [
  {
    id: "pay_001",
    transactionId: "TXN-2026-10-001",
    userId: "uPTC1ueGCW8Yvwb6lMmJ3HJDT19zk02E",
    userName: "Aritro Das",
    userEmail: "aritro@example.com",
    businessId: "d516697f-be66-4718-83e5-a7f4f3c907e6",
    businessName: "Aritro's Fashion House",
    amount: 500,
    currency: "BDT",
    status: "COMPLETED",
    method: "bkash",
    gateway: "SSLCommerz",
    reference: "SSL-TXN-8a7b9c2d",
    createdAt: "2026-10-08T10:30:00Z",
    updatedAt: "2026-10-08T10:32:00Z",
  },
  {
    id: "pay_002",
    transactionId: "TXN-2026-10-002",
    userId: "uPTC1ueGCW8Yvwb6lMmJ3HJDT19zk02E",
    userName: "Madisyn",
    userEmail: "admin@gmail.com",
    businessId: "b_tech_solutions",
    businessName: "Tech Solutions Ltd.",
    amount: 1200,
    currency: "BDT",
    status: "PENDING",
    method: "nagad",
    gateway: "SSLCommerz",
    reference: "SSL-TXN-1f2e3d4c",
    createdAt: "2026-10-09T14:15:00Z",
  },
  {
    id: "pay_003",
    transactionId: "TXN-2026-10-003",
    userId: "user_003",
    userName: "Shakibul Islam",
    userEmail: "shakib@example.com",
    businessId: "b_green_grocery",
    businessName: "Green Grocery",
    amount: 350,
    currency: "BDT",
    status: "FAILED",
    method: "card",
    gateway: "SSLCommerz",
    reference: "SSL-TXN-9z8y7x6w",
    createdAt: "2026-10-09T16:45:00Z",
  },
  {
    id: "pay_004",
    transactionId: "TXN-2026-10-004",
    userId: "user_004",
    userName: "Saheen Akter",
    userEmail: "saheen@example.com",
    businessId: "b_fashion_hub",
    businessName: "Fashion Hub",
    amount: 2500,
    currency: "BDT",
    status: "COMPLETED",
    method: "bkash",
    gateway: "bKash",
    reference: "BK-TXN-5t6y7u8i",
    createdAt: "2026-10-10T08:00:00Z",
    updatedAt: "2026-10-10T08:01:30Z",
  },
  {
    id: "pay_005",
    transactionId: "TXN-2026-10-005",
    userId: "user_005",
    userName: "Shajida Akter",
    userEmail: "shajida@example.com",
    businessId: "b_dma",
    businessName: "Digital Marketing Agency",
    amount: 5000,
    currency: "BDT",
    status: "CANCELLED",
    method: "bank",
    gateway: "SSLCommerz",
    reference: "SSL-TXN-3r4t5y6u",
    createdAt: "2026-10-10T09:30:00Z",
  },
  {
    id: "pay_006",
    transactionId: "TXN-2026-10-006",
    userId: "user_006",
    userName: "Rahim Uddin",
    userEmail: "rahim@example.com",
    businessId: "b_rahim_electronics",
    businessName: "Rahim Electronics",
    amount: 800,
    currency: "BDT",
    status: "COMPLETED",
    method: "bkash",
    gateway: "bKash",
    reference: "BK-TXN-7i8o9p0a",
    createdAt: "2026-10-10T10:45:00Z",
    updatedAt: "2026-10-10T10:46:00Z",
  },
];

// ============================================================
// NORMALIZE — backend response → flat UI shape
// ============================================================

const normalizePayment = (raw: any): IPaymentResponse => {
  const user = raw.user || {};
  const business = raw.business || {};

  return {
    id: raw.id,
    transactionId: raw.transactionId || raw.transaction_id || raw.reference,
    userId: raw.userId || user.id,
    userName: raw.userName || user.name || "-",
    userEmail: raw.userEmail || user.email || "-",
    businessId: raw.businessId || business.id,
    businessName: raw.businessName || business.name || "-",
    amount: Number(raw.amount ?? 0),
    currency: raw.currency || "BDT",
    status: raw.status || "PENDING",
    method: raw.method || raw.paymentMethod || raw.payment_method,
    gateway: raw.gateway || raw.provider,
    reference: raw.reference || raw.txnId,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};

// const USE_DUMMY = true;   // ← change to false

// ============================================================
// GET /api/v1/payments — List all payments (ADMIN)
// ============================================================

export const fetchAllPayments = async (
  filters: IPaymentFilters = {}
): Promise<IPaymentResponse[]> => {
  // 🚧 TEMPORARY: return dummy data while backend endpoint is missing.
  // Remove this block (or set USE_DUMMY = false) when the real endpoint
  // `GET /api/v1/payments` is deployed.
  if (USE_DUMMY) {
    console.log("🎭 [DUMMY] fetchAllPayments — returning fake data.");
    // Filter locally so search/filter still works in dummy mode
    let result = [...DUMMY_PAYMENTS];

    if (filters.status) {
      result = result.filter(
        (p) =>
          String(p.status).toUpperCase() === filters.status!.toUpperCase()
      );
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          (p.transactionId || "").toLowerCase().includes(q) ||
          (p.userName || "").toLowerCase().includes(q) ||
          (p.userEmail || "").toLowerCase().includes(q) ||
          (p.businessName || "").toLowerCase().includes(q)
      );
    }

    await new Promise((r) => setTimeout(r, 400)); // simulate network delay
    return result;
  }

  // ─────────────────────────────────────────────────────────
  // REAL API CALL — uncomment/use when backend is ready
  // ─────────────────────────────────────────────────────────

  const url = apiUrl(`/api/v1/payments${buildQuery(filters)}`);
  console.log("🔍 fetchAllPayments URL:", url);

  try {
    const response = await fetch(url, {
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
    else if (Array.isArray(json?.data?.payments)) rawArray = json.data.payments;

    const normalized = rawArray.map(normalizePayment);
    console.log("✅ fetchAllPayments normalized:", normalized);
    return normalized;
  } catch (error) {
    console.error("❌ fetchAllPayments exception:", error);
    return [];
  }
};

// ============================================================
// GET /api/v1/payments/:id — Single payment
// ============================================================

export const fetchPaymentById = async (
  id: string
): Promise<IPaymentResponse | null> => {
  // 🚧 TEMPORARY: pick from dummy data in dummy mode
  if (USE_DUMMY) {
    const found = DUMMY_PAYMENTS.find((p) => p.id === id);
    return found ?? null;
  }

  try {
    const response = await fetch(apiUrl(`/api/v1/payments/${id}`), {
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