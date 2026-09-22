import Link from 'next/link';
import businesses from '@/public/data/businessCard.json';
import productDetails from '@/public/data/productDetails.json';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const product = productDetails.find((item) => String(item.id) === resolvedParams.id);

  if (!product) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link href="/businesses" className="mt-4 inline-block text-primary hover:underline">
          Back to directory
        </Link>
      </main>
    );
  }

  const business = businesses.find((item) => item.business_id === product.business_id);
  const primaryImage = product.images?.find((image) => image.is_primary)?.url ?? product.images?.[0]?.url ?? 'https://images.unsplash.com/photo-1524758631624-e2822e304c36';
  const galleryImages = product.images?.length ? product.images.map((image) => image.url) : [primaryImage];

  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link href={business ? `/businesses/${business.id}` : '/businesses'} className="text-sm font-medium text-primary hover:underline">
          {business ? `Back to ${business.business_name}` : 'Back to directory'}
        </Link>

        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-border bg-background">
                <img src={primaryImage} alt={product.name} className="h-105 w-full object-cover" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {galleryImages.map((image, index) => (
                  <div key={`${image}-${index}`} className="overflow-hidden rounded-xl border border-border bg-background">
                    <img src={image} alt={`${product.name} gallery ${index + 1}`} className="h-28 w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Product detail</p>
                <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                  ${Number(product.price).toFixed(2)} {product.currency}
                </span>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-600">
                  {product.status}
                </span>
              </div>

              <p className="text-base leading-7 text-muted-foreground">{product.description}</p>

              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Product information
                </h2>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>• Stock: {product.stock ?? 'Out of stock'}</li>
                  <li>• Currency: {product.currency}</li>
                  <li>• Status: {product.status}</li>
                </ul>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button className="flex-1 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  Contact seller
                </button>
                <Link
                  href={business ? `/businesses/${business.id}` : '/businesses'}
                  className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-center text-sm font-semibold text-foreground hover:bg-muted"
                >
                  View business
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}