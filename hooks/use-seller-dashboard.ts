"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getMyBusinesses } from "@/lib/core/business-api";
import { getBusinessProducts, type ProductRecord } from "@/lib/core/product-api";
import { getUnreadNotificationCount } from "@/lib/core/notification-api";
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
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

export function useSellerDashboardData(): SellerDashboardData {
  const [businesses, setBusinesses] = useState<IBusiness[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const businessResult = await getMyBusinesses();
        if (!businessResult.ok || !businessResult.data) {
          throw new Error(businessResult.message);
        }
        const ownedBusinesses = businessResult.data;

        const [productGroups, unread] = await Promise.all([
          Promise.all(
            ownedBusinesses.map(async (business) => {
              const result = await getBusinessProducts(business.id);
              return result.ok && result.data ? result.data : [];
            }),
          ),
          getUnreadNotificationCount(),
        ]);

        if (!active) return;
        setBusinesses(ownedBusinesses);
        setProducts(productGroups.flat());
        setUnreadNotifications(unread);
      } catch (loadError) {
        console.error("Could not load seller dashboard data:", loadError);
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load your dashboard.",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const stats = useMemo<SellerDashboardStats>(() => {
    const published = products.filter((product) => product.status === "ACTIVE").length;
    const drafts = products.filter((product) => product.status === "DRAFT").length;
    const outOfStock = products.filter((product) => product.stock === 0).length;
    const averageTrust = businesses.length
      ? Math.round(
          businesses.reduce((total, business) => total + business.trustScore, 0) /
            businesses.length,
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
    isLoading,
    error,
    reload,
  };
}
