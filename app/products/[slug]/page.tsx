import Link from 'next/link';
import productDetails from '@/public/data/productDetails.json';
import businesses from '@/public/data/businessCard.json';
import { slugify } from '@/app/businessesExplore/page';

type Product = (typeof productDetails)[number];
type Business = (typeof businesses)[number];

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

const getProductBusiness = (product: Product, businessList: Business[]): Business | undefined => {
  return businessList.find(
    (b) =>
      b.owner_id === product.business_id ||
      String(b.id) === product.business_id ||
      b.category_id === product.category_id,
  );
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const resolvedParams = await params;
  const target = resolvedParams.slug?.toLowerCase().trim() ?? '';

  const product = productDetails.find(
    (item) => item.slug?.toLowerCase() === target || String(item.id) === target,
  );

  if (!product) {
    return (
      <main className="min-h-screen bg-background px-4 py-20 text-center font-sans text-foreground">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
          <span className="text-4xl">📦</span>
          <h1 className="mt-4 text-2xl font-bold">Product Not Found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The product you are looking for does not exist or may have been removed.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            ← Back to Product Catalog
          </Link>
        </div>
      </main>
    );
  }

  const business = getProductBusiness(product, businesses);
  const primaryImage =
    product.images?.find((image) => image.is_primary)?.url ??
    product.images?.[0]?.url ??
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.url)
      : [primaryImage];

  const isInStock = typeof product.stock === 'number' && product.stock > 0;
  const businessProfileUrl = business
    ? `/businesses/${slugify(business.business_name)}`
    : '/businesses';

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/products" className="transition hover:text-primary">
            Products
          </Link>
          <span>/</span>
          <span className="truncate font-medium text-foreground">{product.name}</span>
        </div>

        {/* Product Details Container */}
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="grid gap-8 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
            
            {/* Gallery Column */}
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-border bg-muted/30">
                <img
                  src={primaryImage}
                  alt={product.name}
                  className="h-80 sm:h-96 w-full object-cover"
                />
              </div>

              {galleryImages.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {galleryImages.map((imageUrl, index) => (
                    <div
                      key={`${imageUrl}-${index}`}
                      className="overflow-hidden rounded-xl border border-border bg-muted/20"
                    >
                      <img
                        src={imageUrl}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="h-20 w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Column */}
            <div className="space-y-6">
              <div>
                {business && (
                  <Link
                    href={businessProfileUrl}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary hover:underline"
                  >
                    <span>Sold by {business.business_name}</span>
                    <span>↗</span>
                  </Link>
                )}
                <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {product.name}
                </h1>
              </div>

              {/* Price & Availability */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-3xl font-extrabold text-foreground">
                  ${Number(product.price).toFixed(2)}{' '}
                  <span className="text-sm font-normal text-muted-foreground">
                    {product.currency}
                  </span>
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isInStock
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-rose-500/10 text-rose-600'
                  }`}
                >
                  {isInStock ? `In Stock (${product.stock} units)` : 'Out of Stock'}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {product.status}
                </span>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {product.description}
                </p>
              </div>

              {/* Vendor Trust Badge Card */}
              {business && (
                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {business.logo_url ? (
                        <img
                          src={business.logo_url}
                          alt={business.business_name}
                          className="h-10 w-10 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                          {business.business_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {business.business_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {business.business_type} • Verified Vendor
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                        {business.trust_score} Trust
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  className="flex-1 rounded-xl bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                  Contact Seller
                </button>
                {business && (
                  <Link
                    href={businessProfileUrl}
                    className="flex-1 rounded-xl border border-border bg-card px-6 py-3 text-center text-sm font-semibold text-foreground transition hover:bg-muted"
                  >
                    View Business Profile
                  </Link>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <Link
            href="/products"
            className="text-sm font-medium text-primary hover:underline"
          >
            ← Back to Product Catalog
          </Link>
        </div>

      </div>
    </main>
  );
}
