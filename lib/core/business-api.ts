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
 *   POST  /api/v1/businesses/:id/verify      - submit the business for review
 *   DELETE /api/v1/documents/:id              - remove a document (seller-owned)
 *   GET   /api/v1/trust-scores/business/:id  - trust score history/current
 *
 * Every call returns `{ ok, message, data }`; errors never throw.
 */

import { apiUrl } from "@/lib/core/api-url";
import { apiFetch } from "@/lib/core/api-fetch";
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

async function sendJson<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<ApiResult<T>> {
  try {
    const response = await apiFetch(apiUrl(path), {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      credentials: "include",
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
    return toResult<T>(await readEnvelope<T>(response), `Request failed (${response.status}).`);
  } catch (error) {
    // An aborted request is a deliberate cancel (unmount / effect cleanup), not
    // a failure — return quietly so it never reaches the console or the UI.
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, message: "Request cancelled.", data: null };
    }
    console.error("Business API request failed:", error);
    return { ok: false, message: "Could not reach the server. Please try again.", data: null };
  }
}

async function sendMultipart<T>(method: "POST" | "PATCH", path: string, formData: FormData): Promise<ApiResult<T>> {
  try {
    const response = await apiFetch(apiUrl(path), {
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

export async function getMyBusinesses(signal?: AbortSignal): Promise<ApiResult<IBusiness[]>> {
  return sendJson<IBusiness[]>("GET", "/api/v1/businesses/me", undefined, signal);
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

/** Optional files for PATCH — multer fields "logo" (single) and "cover" (single). */
export interface BusinessImageFiles {
  logo?: File;
  cover?: File;
}

export interface UpdateBusinessPayload {
  name?: string;
  description?: string;
  categoryId?: string;
  businessType?: "INDIVIDUAL" | "COMPANY" | "NGO" | "GOVERNMENT" | "OTHER";
  websiteUrl?: string;
  instaUrl?: string;
  tiktokUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
}

/**
 * PATCH /api/v1/businesses/:id
 *
 * The route runs the `uploadBusinessImages` multer middleware, so when any file
 * is included the request must be multipart/form-data. JSON is used when there
 * are no files. Only non-empty scalars are sent, because the server's zod
 * `updateBusinessSchema` rejects "" for URL/enum/uuid/email/phone fields;
 * `description` is always sent so it can be cleared.
 */
export async function updateBusiness(
  id: string,
  payload: UpdateBusinessPayload,
  files?: BusinessImageFiles,
): Promise<ApiResult<IBusiness>> {
  const hasFiles = Boolean(files?.logo || files?.cover);
  if (!hasFiles) {
    return sendJson<IBusiness>("PATCH", `/api/v1/businesses/${encodeURIComponent(id)}`, payload);
  }

  const formData = new FormData();
  if (payload.name) formData.append("name", payload.name);
  if (payload.description !== undefined) formData.append("description", payload.description);
  if (payload.categoryId) formData.append("categoryId", payload.categoryId);
  if (payload.businessType) formData.append("businessType", payload.businessType);
  if (payload.websiteUrl) formData.append("websiteUrl", payload.websiteUrl);
  if (payload.instaUrl) formData.append("instaUrl", payload.instaUrl);
  if (payload.tiktokUrl) formData.append("tiktokUrl", payload.tiktokUrl);
  if (payload.contactEmail) formData.append("contactEmail", payload.contactEmail);
  if (payload.contactPhone) formData.append("contactPhone", payload.contactPhone);
  if (files?.logo) formData.append("logo", files.logo);
  if (files?.cover) formData.append("cover", files.cover);

  return sendMultipart<IBusiness>(
    "PATCH",
    `/api/v1/businesses/${encodeURIComponent(id)}`,
    formData,
  );
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
  /** Cloudinary URL — the backend field is `fileUrl`. */
  fileUrl: string;
  publicId?: string | null;
  status: "APPROVED" | "PENDING" | "REJECTED" | "MISSING";
  uploadedAt?: string;
  createdAt?: string;
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
// DELETE /api/v1/documents/:id
// ---------------------------------------------------------------------------

/**
 * Remove one business document.
 *
 * The backend allows a seller to delete their own document only while it is not
 * `APPROVED` — approved documents are locked and can only be removed by an
 * admin. It also deletes the underlying Cloudinary asset.
 */
export async function deleteBusinessDocument(documentId: string): Promise<ApiResult<null>> {
  return sendJson<null>("DELETE", `/api/v1/documents/${encodeURIComponent(documentId)}`);
}

// ---------------------------------------------------------------------------
// POST /api/v1/businesses/:id/verify
// ---------------------------------------------------------------------------

/** The `BusinessVerification` row the backend returns from a submit/review. */
export interface BusinessVerificationRecord {
  id: string;
  businessId: string;
  submittedBy: string;
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "SUSPENDED";
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  adminNote?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Submit a business for verification.
 *
 * The backend enforces the rules: the caller must own the business, the business
 * must not already be `VERIFIED`, at least one document must be `APPROVED`, and
 * there must be no pending/under-review request. Those are returned as normal
 * error messages (409/422) rather than thrown, so callers should show the real
 * message to the seller instead of inventing one.
 */
export async function submitBusinessVerification(
  businessId: string,
): Promise<ApiResult<BusinessVerificationRecord>> {
  return sendJson<BusinessVerificationRecord>(
    "POST",
    `/api/v1/businesses/${encodeURIComponent(businessId)}/verify`,
  );
}

// ---------------------------------------------------------------------------
// GET /api/v1/trust-scores/business/:id
// ---------------------------------------------------------------------------

/**
 * One trust-score snapshot from `GET /api/v1/trust-scores/business/:id`.
 *
 * The server returns `TrustScore` rows (one per business) serialized with
 * `score` coerced to a number.
 */
export interface TrustScoreHistoryEntry {
  id: string;
  businessId: string;
  score: number;
  /**
   * Points per trust-rule key, e.g. `{ trade_license_01: 20 }`.
   * Note: the backend only records the first awarded rule here, so treat this
   * as partial — a per-rule ledger is not exposed on a public endpoint.
   */
  breakdown: Record<string, number>;
  businessType?: string | null;
  calculatedAt: string;
}

export async function getTrustScoreHistory(
  businessId: string,
): Promise<ApiResult<TrustScoreHistoryEntry[]>> {
  return sendJson<TrustScoreHistoryEntry[]>(
    "GET",
    `/api/v1/trust-scores/business/${encodeURIComponent(businessId)}`,
  );
}