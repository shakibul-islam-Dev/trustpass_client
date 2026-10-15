"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  Building2,
  CircleDollarSign,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { getMyBusinesses } from "@/lib/core/business-api";
import { getBusinessProducts, type ProductRecord } from "@/lib/core/product-api";
import type { IBusiness } from "@/types/business";
import SellerEmptyState from "./SellerEmptyState";
import SellerPageHeader from "./SellerPageHeader";
import SellerStatCard from "./SellerStatCard";
import SellerStatusBadge from "./SellerStatusBadge";
import AnalyticsChart from "../dashboard/AnalyticsChart";

/** Chart palette, pulled from the design tokens in globals.css. */
const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const businessChartConfig = {
  products: { label: "Products", color: "var(--chart-1)" },
} satisfies ChartConfig;

const categoryChartConfig = {
  count: { label: "Products", color: "var(--chart-1)" },
} satisfies ChartConfig;

const formatCurrency = (value: number) => `৳${value.toLocaleString()}`;

const shorten = (name: string) => (name.length > 14 ? `${name.slice(0, 13)}…` : name);


export default function SellerAnalytics() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<IBusiness[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
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


        const productGroups = await Promise.all(
          ownedBusinesses.map(async (business) => {
            const result = await getBusinessProducts(business.id);
            return result.ok && result.data ? result.data : [];
          }),
        );

        if (!active) return;
        setBusinesses(ownedBusinesses);
        setProducts(productGroups.flat());
      } catch (loadError) {
        console.error("Could not load seller analytics:", loadError);
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Could not load analytics.");
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

  const stats = useMemo(() => {
    const published = products.filter((product) => product.status === "ACTIVE").length;
    const outOfStock = products.filter((product) => product.stock === 0).length;
    const inventoryValue = products.reduce(
      (total, product) => total + product.price * product.stock,
      0,
    );
    const verified = businesses.filter(
      (business) => business.verificationStatus === "VERIFIED",
    ).length;
    // `trustScoreUpdatedAt` is null until the API calculates a score, so only
    // scored businesses belong in the average — never-scored ones are not 0s.
    const scored = businesses.filter(
      (business) => business.trustScoreUpdatedAt != null,
    );
    const averageTrust = scored.length
      ? Math.round(
          scored.reduce((total, business) => total + business.trustScore, 0) /
            scored.length,
        )
      : null;

    return { published, outOfStock, inventoryValue, verified, averageTrust };
  }, [businesses, products]);

  const businessChartData = useMemo(
    () =>
      businesses.map((business) => ({
        name: shorten(business.name),
        products: products.filter((product) => product.businessId === business.id).length,
      })),
    [businesses, products],
  );

  const categoryChartData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      const key = product.categoryId ?? "Uncategorized";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [products]);

  const topProducts = useMemo(
    () =>
      [...products]
        .sort((a, b) => b.price * b.stock - a.price * a.stock)
        .slice(0, 5),
    [products],
  );

  // Real catalog-status breakdown for the shared AnalyticsChart.
  const statusSegments = useMemo(
    () => [
      { name: "Published", value: stats.published, color: "var(--color-primary)" },
      { name: "Out of stock", value: stats.outOfStock, color: "var(--color-danger)" },
    ],
    [stats.published, stats.outOfStock],
  );

  const publishedPercentage = products.length
    ? Math.round((stats.published / products.length) * 100)
    : 0;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <SellerPageHeader
        icon={BarChart3}
        title="Analytics"
        badge="Live"
        description="A live snapshot of your businesses, catalog, and trust score, calculated from your account data."
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isLoading}
            onClick={() => setReloadKey((key) => key + 1)}
          >
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        }
      />
      <AnalyticsChart
        segments={statusSegments}
        centerValue={`${publishedPercentage}%`}
        centerLabel="Published"
        pendingMessage="Add products to your catalog and the breakdown will show up here."
      />

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger"
        >
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => setReloadKey((key) => key + 1)}>
            Try again
          </Button>
        </div>
      )}

      {isLoading ? (
        <AnalyticsSkeleton />
      ) : businesses.length === 0 ? (
        <SellerEmptyState
          icon={Building2}
          title="No business data yet"
          description="Create a business profile and add products to see your analytics here."
          action={<Button onClick={() => router.push("/dashboard/seller")}>Set up a business</Button>}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SellerStatCard
              icon={Building2}
              label="Businesses"
              value={businesses.length}
              hint={`${stats.verified} verified`}
            />
            <SellerStatCard
              icon={Boxes}
              label="Products"
              value={products.length}
              hint={`${stats.published} published`}
              tone="neutral"
            />
            <SellerStatCard
              icon={CircleDollarSign}
              label="Inventory value"
              value={formatCurrency(stats.inventoryValue)}
              hint={`${stats.outOfStock} out of stock`}
              tone="success"
            />
            <SellerStatCard
              icon={ShieldCheck}
              label="Average trust"
              value={stats.averageTrust == null ? "—" : `${stats.averageTrust}/100`}
              hint="Across scored businesses"
              tone="warning"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
            <Card className="border-border/80 bg-surface shadow-surface">
              <CardHeader>
                <CardTitle>Products per business</CardTitle>
                <CardDescription>How many products each business lists.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={businessChartConfig} className="h-[260px] w-full">
                  <BarChart accessibilityLayer data={businessChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="products" fill="var(--color-products)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-surface shadow-surface">
              <CardHeader>
                <CardTitle>Catalog by category</CardTitle>
                <CardDescription>Your top product categories.</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryChartData.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    No categorized products yet.
                  </p>
                ) : (
                  <ChartContainer config={categoryChartConfig} className="h-[260px] w-full">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                      <Pie
                        data={categoryChartData}
                        dataKey="count"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={95}
                        paddingAngle={2}
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="border-border/80 bg-surface shadow-surface">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PackageCheck className="size-4 text-primary" />
                  <CardTitle>Top products</CardTitle>
                </div>
                <CardDescription>Ranked by inventory value (price × stock).</CardDescription>
              </CardHeader>
              <CardContent>
                {topProducts.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No products yet.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {topProducts.map((product) => (
                      <li
                        key={product.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/40 p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.stock} in stock
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                          {formatCurrency(product.price * product.stock)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-surface shadow-surface">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  <CardTitle>Trust & verification</CardTitle>
                </div>
                <CardDescription>Verification status and trust score of each business.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {businesses.map((business) => {
                  // `trustScoreUpdatedAt` is null until the API calculates at
                  // least once — that is "not scored yet", not a score of 0.
                  const hasScore = business.trustScoreUpdatedAt != null;
                  const score = Math.min(100, Math.max(0, business.trustScore));
                  return (
                    <div
                      key={business.id}
                      className="rounded-xl border border-border bg-background/40 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-medium text-foreground">
                          {business.name}
                        </p>
                        <SellerStatusBadge status={business.verificationStatus} />
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <div
                          className="h-2 w-full overflow-hidden rounded-full bg-muted"
                          role={hasScore ? "meter" : undefined}
                          aria-label={hasScore ? `${business.name} trust score` : undefined}
                          aria-valuemin={hasScore ? 0 : undefined}
                          aria-valuemax={hasScore ? 100 : undefined}
                          aria-valuenow={hasScore ? score : undefined}
                        >
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: hasScore ? `${score}%` : "0%" }}
                          />
                        </div>
                        <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
                          {hasScore ? `${score}/100` : "Not scored yet"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
        <Skeleton className="h-80 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    </div>
  );
}
