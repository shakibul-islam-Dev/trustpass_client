/**
 * Product API, called from the browser.
 *
 * Auth-protected, so these helpers run in the browser and attach the session
 * cookie via `credentials: "include"` (same rule as profile-api / business-api).
 *
 * Endpoints used:
 *   GET   /api/v1/products/:id            - get one product
 *   GET   /api/v1/businesses/:id/products - products of one business
 *   POST  /api/v1/products                - create a product (multipart)
 *   PATCH /api/v1/products/:id            - update a product (multipart)
 *   DELETE /api/v1/products/:id           - delete a product
 *
 * Every call returns `{ ok, message, data }`; errors never throw.
 */

import { apiUrl } from "@/lib/core/api-url";
import { apiFetch } from "@/lib/core/api-fetch";

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

/** One image stored on a product. The server stores these as `[{ url, publicId }]`. */
export interface ProductImage {
  url: string;
  publicId: string;
}

/** A product exactly as the server stores/returns it. */
export interface ProductRecord {
  id: string;
  businessId: string;
  categoryId: string | null;
  name: string;
  slug?: string;
  description: string | null;
  price: number;
  currency: string;
  stock: number;
  images: ProductImage[];
  status: "DRAFT" | "ACTIVE" | "INACTIVE" | "DELETED";
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductInput {
  name: string;
  categoryId?: string;
  description?: string;
  /** Price as a string from the form — converted to a number before sending. */
  priceString?: string;
  price?: number;
  currency?: string;
  stock?: number;
  status?: "DRAFT" | "ACTIVE" | "INACTIVE" | "DELETED";
}

/**
 * Image changes for updateProduct. The server matches images by `publicId`:
 * - every publicId listed in `retainImagePublicIds` is kept
 * - anything not listed is removed (and deleted from Cloudinary)
 * - `newImages` are uploaded as multipart files under the `images` field
 *
 * Omit `retainImagePublicIds` to keep every current image untouched.
 */
export interface ProductImageChange {
  retainImagePublicIds?: string[];
  newImages?: File[];
}

async function sendJson<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<ApiResult<T>> {
  try {
    const response = await apiFetch(apiUrl(path), {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      credentials: "include",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return toResult<T>(await readEnvelope<T>(response), `Request failed (${response.status}).`);
  } catch (error) {
    console.error("Product API request failed:", error);
    return { ok: false, message: "Could not reach the server. Please try again.", data: null };
  }
}

// ---------------------------------------------------------------------------
// GET /api/v1/products/:id
// ---------------------------------------------------------------------------

export async function getProduct(id: string): Promise<ApiResult<ProductRecord>> {
  return sendJson<ProductRecord>("GET", `/api/v1/products/${encodeURIComponent(id)}`);
}

// ---------------------------------------------------------------------------
// GET /api/v1/businesses/:id/products
// ---------------------------------------------------------------------------

export async function getBusinessProducts(businessId: string): Promise<ApiResult<ProductRecord[]>> {
  return sendJson<ProductRecord[]>(
    "GET",
    `/api/v1/businesses/${encodeURIComponent(businessId)}/products`,
  );
}

// ---------------------------------------------------------------------------
// POST /api/v1/products
// ---------------------------------------------------------------------------

export async function createProduct(
  businessId: string,
  input: ProductInput,
): Promise<ApiResult<ProductRecord>> {
  return sendJson<ProductRecord>("POST", "/api/v1/products", {
    businessId,
    name: input.name,
    categoryId: input.categoryId || undefined,
    description: input.description || undefined,
    price: input.price ?? Number(input.priceString ?? 0),
    currency: input.currency || "BDT",
    stock: input.stock ?? 0,
    status: input.status ?? "DRAFT",
  });
}

// ---------------------------------------------------------------------------
// PATCH /api/v1/products/:id   (multipart/form-data)
// ---------------------------------------------------------------------------

export async function updateProduct(
  id: string,
  input: ProductInput,
  imageChange: ProductImageChange = {},
): Promise<ApiResult<ProductRecord>> {
  try {
    const formData = new FormData();
    if (input.name !== undefined && input.name !== "") formData.set("name", input.name);
    if (input.categoryId) formData.set("categoryId", input.categoryId);
    if (input.description !== undefined) formData.set("description", input.description);
    const price = input.price ?? (input.priceString ? Number(input.priceString) : undefined);
    if (price !== undefined && !Number.isNaN(price)) formData.set("price", String(price));
    if (input.currency) formData.set("currency", input.currency);
    if (input.stock !== undefined) formData.set("stock", String(input.stock));
    if (input.status) formData.set("status", input.status);
    if (imageChange.retainImagePublicIds && imageChange.retainImagePublicIds.length > 0) {
      formData.set("retainImagePublicIds", imageChange.retainImagePublicIds.join(","));
    }
    for (const file of imageChange.newImages ?? []) {
      formData.append("images", file);
    }

    const response = await apiFetch(apiUrl(`/api/v1/products/${encodeURIComponent(id)}`), {
      method: "PATCH",
      credentials: "include",
      body: formData,
    });
    return toResult<ProductRecord>(await readEnvelope(response), `Update failed (${response.status}).`);
  } catch (error) {
    console.error("Product update failed:", error);
    return { ok: false, message: "Could not reach the server. Please try again.", data: null };
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/v1/products/:id
// ---------------------------------------------------------------------------

export async function deleteProduct(id: string): Promise<ApiResult<null>> {
  return sendJson<null>("DELETE", `/api/v1/products/${encodeURIComponent(id)}`);
}