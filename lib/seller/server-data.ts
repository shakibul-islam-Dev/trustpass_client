/**
 * Server-side data for the seller dashboard.
 *
 * Each loader reads the current request's session cookie (via
 * `lib/core/server-api.ts`) and returns plain, serializable data that a Server
 * Component can hand to a Client Component as an initial snapshot. That removes
 * the "render an empty shell, mount, then fetch" sequence the seller pages used
 * to do on the client.
 *
 * Every loader returns `null` on failure so the caller can fall back to the
 * existing client-side fetch rather than render an error page for what is
 * usually a logged-out or transient read.
 *
 * Loaders are wrapped in React `cache()`, so several components on one page
 * share a single request per render.
 */

import { cache } from "react";

import { serverApiGet } from "@/lib/core/server-api";
import type { ProductRecord } from "@/lib/core/product-api";
import type { IBusiness } from "@/types/business";

/**
 * The server caps one page of `/businesses/:id/products` at 100, and returns
 * only 10 without an explicit `limit` — the same reason the browser helper pages
 * through the endpoint.
 */
const PRODUCTS_PAGE_SIZE = 100;

/** Every product of one business, paging until a short page is returned. */
async function fetchBusinessProducts(businessId: string): Promise<ProductRecord[]> {
  const products: ProductRecord[] = [];
  const path = (page: number) =>
    `/api/v1/businesses/${encodeURIComponent(businessId)}/products?limit=${PRODUCTS_PAGE_SIZE}&page=${page}`;

  for (let page = 1; ; page += 1) {
    const result = await serverApiGet<ProductRecord[]>(path(page));
    // Surface a hard failure on the first page; otherwise keep what loaded
    // rather than dropping the whole list for one bad page.
    if (!result.ok) return page === 1 ? [] : products;

    const batch = result.data ?? [];
    products.push(...batch);
    if (batch.length < PRODUCTS_PAGE_SIZE) break;
  }

  return products;
}

/** The seller's own businesses, or `null` when the read failed. */
export const getSellerBusinesses = cache(async (): Promise<IBusiness[] | null> => {
  const result = await serverApiGet<IBusiness[]>("/api/v1/businesses/me");
  if (!result.ok || !result.data) return null;
  return result.data;
});

export interface SellerDashboardServerData {
  businesses: IBusiness[];
  products: ProductRecord[];
}

/**
 * Businesses plus every product across them — the seller Overview and Analytics
 * pages both render from this shape.
 */
export const getSellerDashboardData = cache(
  async (): Promise<SellerDashboardServerData | null> => {
    const businesses = await getSellerBusinesses();
    if (!businesses) return null;

    const productGroups = await Promise.all(
      businesses.map((business) => fetchBusinessProducts(business.id)),
    );

    return { businesses, products: productGroups.flat() };
  },
);
