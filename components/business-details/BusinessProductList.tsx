import Image from 'next/image';
import Link from 'next/link';
import { Package, ShoppingBag } from 'lucide-react';
import type { IProduct } from '@/types/business';

export function BusinessProductList({ products = [] }: { products?: IProduct[] }) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="size-4 text-primary" />
          <h3 className="text-base font-bold text-foreground">
            Products ({products.length})
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const productHref = `/products/${encodeURIComponent(product.slug || product.id)}`;

          return (
            <Link
              key={product.id}
              href={productHref}
              className="group rounded-2xl border border-border/70 bg-card p-3 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Product Image */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted">
                  {product.images?.[0]?.url ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <Package className="size-10 stroke-1" />
                    </div>
                  )}

                  {/* Stock badge */}
                  <span className="absolute top-2 right-2 rounded-md bg-background/80 backdrop-blur-md px-2 py-0.5 text-[11px] font-semibold text-foreground">
                    Stock: {product.stock}
                  </span>
                </div>

                {/* Product Info */}
                <div className="pt-3">
                  <h4 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {product.description || 'No description available.'}
                  </p>
                </div>
              </div>

              {/* Price Row */}
              <div className="pt-3 mt-2 border-t border-border/50 flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">
                  {Number(product.price).toLocaleString()} {product.currency}
                </span>
                <span className="text-[11px] font-medium text-muted-foreground uppercase">
                  {product.status}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}