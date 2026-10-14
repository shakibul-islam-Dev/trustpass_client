"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, BarChart3, Package, PackageCheck, PackageX } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { getMyBusinesses } from "@/lib/core/business-api";
import { getCategories } from "@/lib/categories-api";
import type { IBusiness } from "@/types/business";
import type { ICategory } from "@/types/categories";
import SellerEmptyState from "./SellerEmptyState";
import SellerPageHeader from "./SellerPageHeader";
import SellerProductManagement, { type ProductRecord } from "./SellerProductManagement";
import SellerStatCard from "./SellerStatCard";

/**
 * Dedicated product catalog page.
 *
 * It owns the business picker + stat cards and delegates the actual catalog
 * (search, create, edit, delete) to the existing SellerProductManagement
 * component so none of that logic is duplicated.
 */
export default function SellerProductCatalog() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<IBusiness[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [businessResult, categoryResult] = await Promise.all([
          getMyBusinesses(),
          getCategories(),
        ]);
        if (!active) return;

        if (!businessResult.ok || !businessResult.data) {
          throw new Error(businessResult.message);
        }

        const ownedBusinesses = businessResult.data;
        setBusinesses(ownedBusinesses);
        setSelectedBusinessId((current) => {
          if (ownedBusinesses.some((business) => business.id === current)) return current;
          return ownedBusinesses[0]?.id ?? "";
        });
        setCategories(categoryResult.success && categoryResult.data ? categoryResult.data : []);
      } catch (loadError) {
        console.error("Could not load product catalog:", loadError);
        if (active) {
          setError(
            loadError instanceof Error ? loadError.message : "Could not load your businesses.",
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
  }, []);

  const published = products.filter((product) => product.status === "Published").length;
  const drafts = products.length - published;
  const outOfStock = products.filter((product) => product.stock === 0).length;
  const selectedBusiness = businesses.find((business) => business.id === selectedBusinessId);

  // Stable reference so the child's load effect does not re-run every render.
  const categoryOptions = useMemo(
    () => categories.map((category) => ({ id: category.id, name: category.name })),
    [categories],
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <SellerPageHeader
        icon={Package}
        title="My products"
        badge={selectedBusiness ? selectedBusiness.name : "Catalog"}
        description="Add, edit, and organize the products in your catalog. Changes are saved to the server."
        actions={
          <Link
            href="/dashboard/seller/analytics"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <BarChart3 className="size-4" />
            View analytics
          </Link>
        }
      />

      {error && (
        <div role="alert" className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {!isLoading && businesses.length === 0 ? (
        <SellerEmptyState
          icon={Package}
          title="Create a business first"
          description="Products belong to a business profile. Set up your business before adding products."
          action={<Button onClick={() => router.push("/dashboard/seller")}>Set up a business</Button>}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SellerStatCard icon={Package} label="Total products" value={products.length} hint="Across the selected business" />
            <SellerStatCard icon={PackageCheck} label="Published" value={published} tone="success" hint="Visible to customers" />
            <SellerStatCard icon={PackageX} label="Drafts" value={drafts} tone="neutral" hint="Still being worked on" />
            <SellerStatCard icon={AlertTriangle} label="Out of stock" value={outOfStock} tone="warning" hint="Need restocking" />
          </div>

          {businesses.length > 1 && (
            <label className="block max-w-md space-y-2 text-sm font-medium text-foreground">
              Managing products for
              <select
                value={selectedBusinessId}
                onChange={(event) => setSelectedBusinessId(event.target.value)}
                className="h-10 w-full rounded-field border border-border bg-surface px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
              >
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {selectedBusinessId ? (
            <SellerProductManagement
              businessId={selectedBusinessId}
              categories={categoryOptions}
              onProductsChange={setProducts}
              detailHref={(product) => `/dashboard/seller/products/${product.id}`}
            />
          ) : (
            <p role="status" className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
              Loading your catalog…
            </p>
          )}
        </>
      )}
    </div>
  );
}