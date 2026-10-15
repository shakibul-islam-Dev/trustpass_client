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

/**
 * Normalize a product's `images` field down to plain URLs.
 *
 * The single-product endpoint (`GET /api/v1/products/:id`) returns
 * `[{ url, publicId }]`, while the list endpoints (`GET /api/v1/products`,
 * `GET /api/v1/businesses/:id/products`) return plain URL strings. Accepting
 * both means a product thumbnail renders no matter which endpoint fed it.
 */
export function productImageUrls(images: unknown): string[] {
  if (!Array.isArray(images)) return [];
  return images
    .map((image) => {
      if (typeof image === "string") return image;
      if (image && typeof image === "object" && "url" in image) {
        return String((image as { url?: unknown }).url ?? "");
      }
      return "";
    })
    .filter((url) => url.trim().length > 0);
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
  /** Drafts are gone — a product is stored approved (ACTIVE) or held (INACTIVE). */
  status?: "ACTIVE" | "INACTIVE" | "DELETED";
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

/**
 * The server caps a single page at 100 (`product.service.ts`). Without an
 * explicit `limit` it returns only the first 10, which made the seller
 * dashboard/analytics undercount and the product list truncate.
 */
const PRODUCTS_PAGE_SIZE = 100;

/**
 * Fetch every product of a business by paging through the paginated endpoint.
 *
 * The response envelope carries `meta`, but `sendJson` returns only `data`, so
 * we keep requesting pages until one comes back short of a full page.
 */
export async function getBusinessProducts(
  businessId: string,
  signal?: AbortSignal,
): Promise<ApiResult<ProductRecord[]>> {
  const path = (page: number) =>
    `/api/v1/businesses/${encodeURIComponent(businessId)}/products?limit=${PRODUCTS_PAGE_SIZE}&page=${page}`;

  const products: ProductRecord[] = [];

  for (let page = 1; ; page += 1) {
    const result = await sendJson<ProductRecord[]>("GET", path(page), undefined, signal);
    if (!result.ok) {
      // Surface the error only if we have nothing yet; otherwise return what we
      // could load rather than dropping the whole list.
      return page === 1 ? result : { ok: true, message: result.message, data: products };
    }

    const batch = result.data ?? [];
    products.push(...batch);
    if (batch.length < PRODUCTS_PAGE_SIZE) break;
  }

  return { ok: true, message: "Products fetched successfully.", data: products };
}

// ---------------------------------------------------------------------------
// POST /api/v1/products
// ---------------------------------------------------------------------------

/**
 * Create a product.
 *
 * `POST /api/v1/products` is documented as multipart (the same `images` field
 * PATCH uses). When the seller picked image files we send multipart so they are
 * uploaded together with the product; otherwise we keep the original JSON
 * request so the no-image path is unchanged.
 */
export async function createProduct(
  businessId: string,
  input: ProductInput,
  imageFiles?: File[],
): Promise<ApiResult<ProductRecord>> {
  const price = input.price ?? Number(input.priceString ?? 0);
  const files = imageFiles ?? [];

  if (files.length === 0) {
    return sendJson<ProductRecord>("POST", "/api/v1/products", {
      businessId,
      name: input.name,
      categoryId: input.categoryId || undefined,
      description: input.description || undefined,
      price,
      currency: input.currency || "BDT",
      stock: input.stock ?? 0,
      status: input.status ?? "ACTIVE",
    });
  }

  try {
    const formData = new FormData();
    formData.set("businessId", businessId);
    formData.set("name", input.name);
    if (input.categoryId) formData.set("categoryId", input.categoryId);
    if (input.description) formData.set("description", input.description);
    formData.set("price", String(price));
    formData.set("currency", input.currency || "BDT");
    formData.set("stock", String(input.stock ?? 0));
    formData.set("status", input.status ?? "ACTIVE");
    for (const file of files) {
      formData.append("images", file);
    }

    const response = await apiFetch(apiUrl("/api/v1/products"), {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    return toResult<ProductRecord>(await readEnvelope<ProductRecord>(response), `Create failed (${response.status}).`);
  } catch (error) {
    console.error("Product create failed:", error);
    return { ok: false, message: "Could not reach the server. Please try again.", data: null };
  }
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