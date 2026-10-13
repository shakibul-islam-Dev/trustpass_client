"use client";

import {
  CircleDollarSign,
  ClipboardList,
  Package,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

import StatCards, { type StatItem } from "../dashboard/StatCard";
import ReportsChart from "../dashboard/ReportsChart";
import AnalyticsChart from "../dashboard/AnalyticsChart";
import RecentOrders from "../dashboard/RecentOrders";
import TopSellingProducts from "../dashboard/TopSellingProducts";
import { useSellerDashboardData } from "@/hooks/use-seller-dashboard";

/** Explains a metric that the backend cannot provide yet. */
const PENDING = "Awaiting the orders API";

/** Shown by the order/sales cards until the backend has order data. */
const ORDERS_PENDING_MESSAGE =
  "Order and sales data is not available yet — the backend has no orders API. This card fills in automatically once it ships.";

const pendingStat = (
  id: string,
  label: string,
  icon: LucideIcon,
): StatItem => ({
  id,
  value: "—",
  label,
  icon,
  iconColor: "text-muted-foreground",
  bgColor: "bg-surface-secondary",
  caption: PENDING,
});

export default function SellerDashboard() {
  const { stats, productStatusSegments, publishedPercentage, isLoading, error } =
    useSellerDashboardData();

  const statItems: StatItem[] = [
    pendingStat("revenue", "Total Revenue", CircleDollarSign),
    pendingStat("orders", "Total Orders", ShoppingBag),
    {
      id: "products",
      value: isLoading ? "…" : String(stats.productCount),
      label: "Total Products",
      icon: Package,
      iconColor: "text-primary",
      bgColor: "bg-primary-soft",
      caption: isLoading
        ? undefined
        : `${stats.publishedCount} published · ${stats.draftCount} draft`,
    },
    pendingStat("pending-orders", "Pending Orders", ClipboardList),
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger"
        >
          {error}
        </div>
      )}

      {/* 1. Top Section: 4 Stat Cards */}
      <StatCards items={statItems} />

      {/* 2. Middle Section: Reports Chart (2 cols) & Analytics Chart (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 w-full">
          <ReportsChart title="Reports" valueLabel="Revenue" pendingMessage={ORDERS_PENDING_MESSAGE} />
        </div>
        <div className="lg:col-span-1 w-full">
          <AnalyticsChart
            segments={productStatusSegments}
            centerValue={isLoading ? undefined : `${publishedPercentage}%`}
            centerLabel="Published"
            pendingMessage="Add products to your catalog and the breakdown will show up here."
          />
        </div>
      </div>

      {/* 3. Bottom Section: Recent Orders Table (2 cols) & Top Selling Products (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 w-full overflow-x-auto">
          <RecentOrders pendingMessage={ORDERS_PENDING_MESSAGE} />
        </div>
        <div className="lg:col-span-1 w-full">
          <TopSellingProducts pendingMessage={ORDERS_PENDING_MESSAGE} />
        </div>
      </div>
    </div>
  );
}
