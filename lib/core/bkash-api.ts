import { apiFetch } from "@/lib/core/api-fetch";
import { apiUrl } from "@/lib/core/api-url";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export type PaymentStatus =
    | "PENDING"
    | "SUCCESS"
    | "FAILED"
    | "CANCELLED"
    | "REFUNDED";

export interface PaymentRecord {
    id: string;
    businessId?: string;
    userId?: string;
    paymentID?: string;       // bKash transaction ID
    trxId?: string;
    merchantInvoiceNumber?: string;
    amount: string;
    currency?: string;
    slotsToUnlock?: number;
    status: PaymentStatus;
    purpose?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ListingQuota {
    totalSlots: number;
    usedSlots: number;
    remainingSlots: number;
}

export interface PaymentApiResult<T> {
    ok: boolean;
    message: string;
    data: T | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function parseBody<T>(response: Response): Promise<{ success: boolean; message?: string; data?: T }> {
    try {
        return await response.json() as { success: boolean; message?: string; data?: T };
    } catch {
        return { success: false, message: `HTTP ${response.status}` };
    }
}

// ---------------------------------------------------------------------------
// POST /api/v1/payments/bkash/create
// ---------------------------------------------------------------------------

export interface BkashInitiateData {
    paymentId: string;
    bkashURL: string;
    paymentID: string;
    merchantInvoiceNumber: string;
    amount: string;
    currency: string;
    slotsToUnlock: number;
}

export async function initiateBkashPayment(
    businessId: string,
    slotsToUnlock = 1,
): Promise<BkashInitiateData> {
    const response = await apiFetch(apiUrl("/api/v1/payments/bkash/create"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, slotsToUnlock }),
    });

    const body = await parseBody<BkashInitiateData>(response);

    if (!response.ok || !body.success) {
        console.error("[bKash] initiate failed:", response.status, body);
        throw new Error(body.message ?? `Payment initiation failed (${response.status}).`);
    }

    return body.data!;
}

// ---------------------------------------------------------------------------
// GET /api/v1/payments/:id  — verify a single payment by internal paymentId
// ---------------------------------------------------------------------------

export async function getPaymentById(paymentId: string): Promise<PaymentRecord | null> {
    const response = await apiFetch(
        apiUrl(`/api/v1/payments/${encodeURIComponent(paymentId)}`),
        { method: "GET", credentials: "include" },
    );

    const body = await parseBody<PaymentRecord>(response);

    if (!response.ok || !body.success) return null;
    return body.data ?? null;
}

// ---------------------------------------------------------------------------
// GET /api/v1/payments/my-payments  — authenticated seller's payment history
// ---------------------------------------------------------------------------

export async function getMyPayments(): Promise<PaymentApiResult<PaymentRecord[]>> {
    try {
        const response = await apiFetch(apiUrl("/api/v1/payments/my-payments"), {
            method: "GET",
            credentials: "include",
        });
        const body = await parseBody<PaymentRecord[]>(response);

        if (!response.ok || !body.success || !Array.isArray(body.data)) {
            return {
                ok: false,
                message: body.message ?? `Could not load payment history (${response.status}).`,
                data: null,
            };
        }
        return { ok: true, message: body.message ?? "Payment history loaded.", data: body.data };
    } catch (error) {
        console.error("[bKash] payment history request failed:", error);
        return {
            ok: false,
            message: error instanceof Error ? error.message : "Could not load payment history.",
            data: null,
        };
    }
}

// ---------------------------------------------------------------------------
// GET /api/v1/payments/quota  — listing slot quota
// ---------------------------------------------------------------------------

export async function getListingQuota(): Promise<PaymentApiResult<ListingQuota>> {
    try {
        const response = await apiFetch(apiUrl("/api/v1/payments/quota"), {
            method: "GET",
            credentials: "include",
        });
        const body = await parseBody<ListingQuota>(response);

        if (!response.ok || !body.success || !body.data) {
            return {
                ok: false,
                message: body.message ?? `Could not load listing quota (${response.status}).`,
                data: null,
            };
        }
        return { ok: true, message: body.message ?? "Listing quota loaded.", data: body.data };
    } catch (error) {
        console.error("[bKash] listing quota request failed:", error);
        return {
            ok: false,
            message: error instanceof Error ? error.message : "Could not load listing quota.",
            data: null,
        };
    }
}
