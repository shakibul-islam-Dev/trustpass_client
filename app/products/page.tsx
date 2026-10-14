
import { ProductCatalogFilters } from "@/components/products/ProductCatalogFilters";
import ProductGrid from "@/components/products/ProductGrid";
import ProductPagination from "@/components/products/ProductPagination";
import { fetchProducts } from "@/lib/products-api/create-products";

type ProductsPageProps = {
  searchParams: Promise<{
    query?: string;
    status?: string;
    page?: string;
    limit?: string;
  }>;
};

const PAGE_SIZE = 12;

export default async function ProductsCatalogPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const query = params.query?.trim() ?? "";
  const statusFilter = params.status?.trim().toUpperCase() ?? "ALL";
  const currentPage = Math.max(1, Number(params.page ?? 1));
  const limit = Math.max(1, Number(params.limit ?? PAGE_SIZE));

  const { products, total, totalPages } = await fetchProducts({
    page: currentPage,
    limit,
    search: query || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
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

        <ProductCatalogFilters
          query={query}
          statusFilter={statusFilter}
          totalCount={total}
          filteredCount={products.length}
        />

        <ProductGrid products={products} />

        {totalPages > 1 && (
          <ProductPagination
            currentPage={currentPage}
            totalPages={totalPages}
            query={query}
            statusFilter={statusFilter}
            limit={limit}
          />
        )}
      </div>
    </main>
  );
}