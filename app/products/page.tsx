import Link from 'next/link';
import productDetails from '@/public/data/productDetails.json';
import businesses from '@/public/data/businessCard.json';

type Product = (typeof productDetails)[number];
type Business = (typeof businesses)[number];

type ProductsPageProps = {
  searchParams: Promise<{
    query?: string;
    stock?: string;
  }>;
};

const getProductBusiness = (product: Product, businessList: Business[]): Business | undefined => {
  return businessList.find(
    (b) =>
      b.owner_id === product.business_id ||
      String(b.id) === product.business_id ||
      b.category_id === product.category_id,
  );
};

export default async function ProductsCatalogPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = params.query?.trim().toLowerCase() ?? '';
  const stockFilter = params.stock?.trim().toLowerCase() ?? 'all';

  const filteredProducts = productDetails.filter((product) => {
    const matchesQuery = query
      ? product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      : true;

    const matchesStock =
      stockFilter === 'in_stock'
        ? typeof product.stock === 'number' && product.stock > 0
        : true;

    return matchesQuery && matchesStock;
  });

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Header */}
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

        {/* Filter Card */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <form className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label
                htmlFor="query"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Search Products
              </label>
              <input
                id="query"
                defaultValue={query}
                name="query"
                placeholder="Product name, keywords..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="md:col-span-1">
              <label
                htmlFor="stock"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Availability
              </label>
              <select
                id="stock"
                defaultValue={stockFilter}
                name="stock"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="all">All Items</option>
                <option value="in_stock">In Stock Only</option>
              </select>
            </div>

            <div className="md:col-span-1 flex items-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Filter Catalog
              </button>
            </div>
          </form>
        </div>

        {/* Results Counter */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">
            Showing <span className="font-bold text-foreground">{filteredProducts.length}</span> of {productDetails.length} products
          </p>
          {(query || stockFilter !== 'all') && (
            <Link
              href="/products"
              className="text-xs font-medium text-primary hover:underline"
            >
              Reset filters
            </Link>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <h2 className="text-lg font-semibold">No products found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search terms or filter settings.
            </p>
            <Link
              href="/products"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              View all products
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const business = getProductBusiness(product, businesses);
              const primaryImage =
                product.images?.find((img) => img.is_primary)?.url ??
                product.images?.[0]?.url ??
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80';
              const isInStock = typeof product.stock === 'number' && product.stock > 0;
              const productSlug = product.slug || String(product.id);

              return (
                <div
                  key={product.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg"
                >
                  <div>
                    {/* Product Image */}
                    <div className="relative h-48 w-full overflow-hidden bg-muted">
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur ${
                            isInStock
                              ? 'bg-emerald-500/90 text-white'
                              : 'bg-rose-500/90 text-white'
                          }`}
                        >
                          {isInStock ? `In Stock (${product.stock})` : 'Out of Stock'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {business && (
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          {business.business_name}
                        </p>
                      )}
                      <h2 className="mt-1.5 text-base font-bold text-card-foreground group-hover:text-primary transition-colors">
                        <Link href={`/products/${productSlug}`}>
                          {product.name}
                        </Link>
                      </h2>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="border-t border-border p-5 pt-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-muted-foreground">Price</span>
                        <p className="text-lg font-bold text-foreground">
                          ${Number(product.price).toFixed(2)}{' '}
                          <span className="text-xs font-normal text-muted-foreground">
                            {product.currency}
                          </span>
                        </p>
                      </div>
                      <Link
                        href={`/products/${productSlug}`}
                        className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
