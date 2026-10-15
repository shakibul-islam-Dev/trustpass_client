"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getMyBusinesses } from "@/lib/core/business-api";
import { getBusinessProducts, type ProductRecord } from "@/lib/core/product-api";
import { useUnreadCount } from "@/hooks/use-unread-count";
import type { IBusiness } from "@/types/business";
import type { AnalyticsSegment } from "@/components/dashboard/AnalyticsChart";

/**
 * Loads everything the seller Overview can show with real data today.
 *
 * The platform has no orders/sales backend yet, so revenue and order metrics
 * are intentionally absent here — the Overview renders a labelled empty state
 * for those instead of inventing numbers.
 */
export interface SellerDashboardStats {
  businessCount: number;
  productCount: number;
  publishedCount: number;
  draftCount: number;
  outOfStockCount: number;
  averageTrustScore: number | null;
  unreadNotifications: number;
}

export interface SellerDashboardData {
  businesses: IBusiness[];
  products: ProductRecord[];
  stats: SellerDashboardStats;
  /** Real product-status breakdown for the Overview donut chart. */
  productStatusSegments: AnalyticsSegment[];
  /** Published share of the catalog (0–100), used as the donut centre value. */
  publishedPercentage: number;
  /** True until the business list has resolved. */
  isBusinessesLoading: boolean;
  /** True until the product list has resolved. */
  isProductsLoading: boolean;
  /** True while either list is still loading. */
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * A snapshot the Server Component already fetched, so the first client render
 * can paint with data instead of an empty shell. Optional: when it is absent
 * the hook falls back to fetching in the browser.
 */
export interface SellerDashboardInitialData {
  businesses: IBusiness[];
  products: ProductRecord[];
}

export function useSellerDashboardData(
  initialData?: SellerDashboardInitialData,
): SellerDashboardData {
  const hasInitialData = Boolean(initialData);
  const [businesses, setBusinesses] = useState<IBusiness[]>(initialData?.businesses ?? []);
  const [products, setProducts] = useState<ProductRecord[]>(initialData?.products ?? []);
  const [isBusinessesLoading, setIsBusinessesLoading] = useState(!hasInitialData);
  const [isProductsLoading, setIsProductsLoading] = useState(!hasInitialData);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Read from the shared store so this page does not fire a second
  // `/notifications/unread-count` request alongside the sidebar's. It also
  // starts in parallel with the business fetch below rather than after it.
  const unreadNotifications = useUnreadCount();

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const load = async () => {
      setIsBusinessesLoading(true);
      setIsProductsLoading(true);
      setError(null);

      try {
        const businessResult = await getMyBusinesses(controller.signal);
        if (!active) return;
        if (!businessResult.ok || !businessResult.data) {
          throw new Error(businessResult.message);
        }
        const ownedBusinesses = businessResult.data;

        // Show the businesses as soon as they arrive — the product list is a
        // separate, slower round-trip and the Overview should not wait on it.
        setBusinesses(ownedBusinesses);
        setIsBusinessesLoading(false);

        const productGroups = await Promise.all(
          ownedBusinesses.map(async (business) => {
            const result = await getBusinessProducts(business.id, controller.signal);
            return result.ok && result.data ? result.data : [];
          }),
        );

        if (!active) return;
        setProducts(productGroups.flat());
      } catch (loadError) {
        if (!active) return;
        console.error("Could not load seller dashboard data:", loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load your dashboard.",
        );
      } finally {
        if (active) {
          setIsBusinessesLoading(false);
          setIsProductsLoading(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
      // Cancel in-flight requests so a quick unmount (or the dev double-mount)
      // does not leave work running or set stale state.
      controller.abort();
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const stats = useMemo<SellerDashboardStats>(() => {
    const published = products.filter((product) => product.status === "ACTIVE").length;
    const drafts = products.filter((product) => product.status === "DRAFT").length;
    const outOfStock = products.filter((product) => product.stock === 0).length;
    // The API writes `trustScoreUpdatedAt` whenever it calculates a score, so
    // `null` means "never scored", not "scored zero". Averaging those in would
    // drag the average down for businesses the API has never evaluated.
    const scored = businesses.filter(
      (business) => business.trustScoreUpdatedAt != null,
    );
    const averageTrust = scored.length
      ? Math.round(
          scored.reduce((total, business) => total + business.trustScore, 0) /
            scored.length,
        )
      : null;

    return {
      businessCount: businesses.length,
      productCount: products.length,
      publishedCount: published,
      draftCount: drafts,
      outOfStockCount: outOfStock,
      averageTrustScore: averageTrust,
      unreadNotifications,
    };
  }, [businesses, products, unreadNotifications]);

  const productStatusSegments = useMemo<AnalyticsSegment[]>(() => {
    const segments: AnalyticsSegment[] = [
      { name: "Published", value: stats.publishedCount, color: "var(--color-primary)" },
      { name: "Draft", value: stats.draftCount, color: "var(--color-warning)" },
      { name: "Out of stock", value: stats.outOfStockCount, color: "var(--color-danger)" },
    ];
    return segments;
  }, [stats.publishedCount, stats.draftCount, stats.outOfStockCount]);

  const publishedPercentage = stats.productCount
    ? Math.round((stats.publishedCount / stats.productCount) * 100)
    : 0;

  return {
    businesses,
    products,
    stats,
    productStatusSegments,
    publishedPercentage,
    isBusinessesLoading,
    isProductsLoading,
    isLoading: isBusinessesLoading || isProductsLoading,
    error,
    reload,
  };
}
