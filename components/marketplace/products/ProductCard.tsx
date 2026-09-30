import Link from 'next/link';
import Image from 'next/image';
import productDetails from '@/public/data/productDetails.json';
import businesses from '@/public/data/businessCard.json';

type Product = (typeof productDetails)[number];
type Business = (typeof businesses)[number];

type ProductCardProps = {
  product: Product;
  business?: Business;
};

export default function ProductCard({ product, business }: ProductCardProps) {
  const primaryImage =
    product.images?.find((image) => image.is_primary)?.url ??
    product.images?.[0]?.url ??
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80';
  const isInStock = typeof product.stock === 'number' && product.stock > 0;
  const productSlug = product.slug || String(product.id);

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg">
      <div>
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <Image
            src={primaryImage}
            alt={product.name}
            width={400}
            height={400}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur ${
                isInStock ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'
              }`}
            >
              {isInStock ? `In Stock (${product.stock})` : 'Out of Stock'}
            </span>
          </div>
        </div>

        <div className="p-5">
          {business && (
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {business.business_name}
            </p>
          )}
          <h2 className="mt-1.5 text-base font-bold text-card-foreground group-hover:text-primary transition-colors">
            <Link href={`/products/${productSlug}`}>{product.name}</Link>
          </h2>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        </div>
      </div>
      
      <div className="border-t border-border p-5 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground">Price</span>
            <p className="text-lg font-bold text-foreground">
              ${Number(product.price).toFixed(2)}{' '}
              <span className="text-xs font-normal text-muted-foreground">{product.currency}</span>
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
}