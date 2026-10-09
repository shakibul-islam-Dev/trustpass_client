/**
 * Business API, called from the browser.
 *
 * Same rule as `lib/core/profile-api.ts`: these endpoints are auth-protected,
 * so these helpers run in the browser and send the session cookie via
 * `credentials: "include"` (a "use server" file cannot attach it here).
 *
 * Endpoints used:
 *   GET   /api/v1/businesses/me              - the seller's own businesses
 *   POST  /api/v1/businesses                 - create a business
 *   PATCH /api/v1/businesses/:id             - update general details
 *   PATCH /api/v1/businesses/:id/address     - update the business address
 *   POST  /api/v1/businesses/:id/documents   - upload a business document
 *   GET   /api/v1/businesses/:id/documents   - list document statuses
 *   GET   /api/v1/trust-scores/business/:id  - trust score history/current
 *
 * Every call returns `{ ok, message, data }`; errors never throw.
 */

import { apiUrl } from "@/lib/core/api-url";
import type { IBusiness } from "@/types/business";

interface ApiEnvelope<T> {
  success: boolean;
  statusCode?: number;
  message?: string;
  data?: T;
}

export interface ApiResult<T> {
  ok: boolean;
  message: string;
  data: T | null;
}

function toResult<T>(envelope: ApiEnvelope<T> | null, fallback: string): ApiResult<T> {
  if (!envelope) {
    return { ok: false, message: fallback, data: null };
  }
  if (!envelope.success) {
    return { ok: false, message: envelope.message || fallback, data: null };
  }
  return { ok: true, message: envelope.message || "Done.", data: envelope.data ?? null };
}

async function readEnvelope<T>(response: Response): Promise<ApiEnvelope<T> | null> {
  try {
    return (await response.json()) as ApiEnvelope<T>;
  } catch {
    return null;
  }
}

async function sendJson<T>(method: "GET" | "POST" | "PATCH", path: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const response = await fetch(apiUrl(path), {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      credentials: "include",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return toResult<T>(await readEnvelope<T>(response), `Request failed (${response.status}).`);
  } catch (error) {
    console.error("Business API request failed:", error);
    return { ok: false, message: "Could not reach the server. Please try again.", data: null };
  }
}

async function sendMultipart<T>(method: "POST", path: string, formData: FormData): Promise<ApiResult<T>> {
  try {
    const response = await fetch(apiUrl(path), {
      method,
      credentials: "include",
      // No Content-Type header: the browser sets the multipart boundary itself.
      body: formData,
    });
    return toResult<T>(await readEnvelope<T>(response), `Request failed (${response.status}).`);
  } catch (error) {
    console.error("Business upload failed:", error);
    return { ok: false, message: "Could not reach the server. Please try again.", data: null };
  }
}

// ---------------------------------------------------------------------------
// GET /api/v1/businesses/me
// ---------------------------------------------------------------------------

export async function getMyBusinesses(): Promise<ApiResult<IBusiness[]>> {
  return sendJson<IBusiness[]>("GET", "/api/v1/businesses/me");
}

// ---------------------------------------------------------------------------
// GET /api/v1/businesses/:id   (public — no auth needed)
// ---------------------------------------------------------------------------

export async function getBusinessById(id: string): Promise<ApiResult<IBusiness>> {
  return sendJson<IBusiness>("GET", `/api/v1/businesses/${encodeURIComponent(id)}`);
}

// ---------------------------------------------------------------------------
// POST /api/v1/businesses
// ---------------------------------------------------------------------------

export interface AddressPayload {
  addressLine: string;
  city: string;
  district: string;
  division: string;
  postalCode: string;
  country?: string;
}

export interface CreateBusinessPayload {
  name: string;
  categoryId: string;
  description?: string;
  businessType?: "INDIVIDUAL" | "COMPANY" | "NGO" | "GOVERNMENT" | "OTHER";
  websiteUrl?: string;
  instaUrl?: string;
  tiktokUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: AddressPayload;
}

export async function createBusiness(payload: CreateBusinessPayload): Promise<ApiResult<IBusiness>> {
  return sendJson<IBusiness>("POST", "/api/v1/businesses", payload);
}

// ---------------------------------------------------------------------------
// PATCH /api/v1/businesses/:id
// ---------------------------------------------------------------------------

export interface UpdateBusinessPayload {
  name?: string;
  description?: string;
  websiteUrl?: string;
  instaUrl?: string;
  tiktokUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  businessType?: "INDIVIDUAL" | "COMPANY" | "NGO" | "GOVERNMENT" | "OTHER";
}

export async function updateBusiness(id: string, payload: UpdateBusinessPayload): Promise<ApiResult<IBusiness>> {
  return sendJson<IBusiness>("PATCH", `/api/v1/businesses/${encodeURIComponent(id)}`, payload);
}

// ---------------------------------------------------------------------------
// PATCH /api/v1/businesses/:id/address
// ---------------------------------------------------------------------------

export async function updateBusinessAddress(id: string, address: AddressPayload): Promise<ApiResult<IBusiness>> {
  return sendJson<IBusiness>("PATCH", `/api/v1/businesses/${encodeURIComponent(id)}/address`, address);
}

// ---------------------------------------------------------------------------
// POST /api/v1/businesses/:id/documents  (multipart, field "file")
// ---------------------------------------------------------------------------

/** Document types accepted by the server (UI "TIN" maps to TIN_CERTIFICATE). */
export type BusinessDocumentType =
  | "TRADE_LICENSE"
  | "NID"
  | "TIN_CERTIFICATE"
  | "VAT_CERTIFICATE"
  | "BANK_STATEMENT"
  | "UTILITY_BILL"
  | "OTHER";

export interface BusinessDocument {
  id: string;
  businessId: string;
  documentType: BusinessDocumentType;
  documentUrl: string;
  publicId?: string | null;
  status: "APPROVED" | "PENDING" | "REJECTED" | "MISSING";
  uploadedAt?: string;
  updatedAt?: string;
  expiresAt?: string | null;
  rejectionReason?: string | null;
}

export async function uploadBusinessDocument(
  businessId: string,
  documentType: BusinessDocumentType,
  file: File,
): Promise<ApiResult<BusinessDocument>> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentType", documentType);

  return sendMultipart<BusinessDocument>(
    "POST",
    `/api/v1/businesses/${encodeURIComponent(businessId)}/documents`,
    formData,
  );
}

// ---------------------------------------------------------------------------
// GET /api/v1/businesses/:id/documents
// ---------------------------------------------------------------------------

export async function getBusinessDocuments(businessId: string): Promise<ApiResult<BusinessDocument[]>> {
  return sendJson<BusinessDocument[]>(
    "GET",
    `/api/v1/businesses/${encodeURIComponent(businessId)}/documents`,
  );
}

// ---------------------------------------------------------------------------
// GET /api/v1/trust-scores/business/:id
// ---------------------------------------------------------------------------

export interface TrustScoreHistoryEntry {
  id?: string;
  score?: number;
  reason?: string | null;
  createdAt?: string;
  changedBy?: string | null;
}

export async function getTrustScoreHistory(
  businessId: string,
): Promise<ApiResult<TrustScoreHistoryEntry[]>> {
  return sendJson<TrustScoreHistoryEntry[]>(
    "GET",
    `/api/v1/trust-scores/business/${encodeURIComponent(businessId)}`,
  );
}