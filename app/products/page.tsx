import { cache } from "react";
import ProductCatalogFilters from "@/components/marketplace/products/ProductCatalogFilters";
import ProductGrid from "@/components/products/ProductGrid";
import { fetchAllProducts } from "@/lib/admin_api/get-products";
import { createPageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(
  "Products",
  "Browse authentic products from businesses listed on TrustPass."
);

const getProducts = cache(() =>
  fetchAllProducts({ page: 1, limit: 100 })
);

type ProductsPageProps = {
  searchParams: Promise<{
    query?: string;
    stock?: string;
    page?: string;
    limit?: string;
  }>;
};

export default async function ProductsCatalogPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const query = params.query?.trim().toLowerCase() ?? "";
  const stockFilter = params.stock?.trim().toLowerCase() ?? "all";

  const allProducts = await getProducts();

  const filteredProducts = allProducts.filter((product) => {
    const matchesQuery = query
      ? product.name.toLowerCase().includes(query) ||
        (product.description ?? "").toLowerCase().includes(query)
      : true;

    const matchesStock =
      stockFilter === "in_stock"
        ? typeof product.stock === "number" && product.stock > 0
        : true;

    return matchesQuery && matchesStock;
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Marketplace Catalog
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Explore Verified Products
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse authentic products from businesses verified by TrustPass.
          </p>
        </div>

        <ProductCatalogFilters query={query} stockFilter={stockFilter} />
        <ProductGrid products={filteredProducts} />
      </div>
    </main>
  );
}