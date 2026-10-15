import Link from 'next/link';
import ProductCard from './ProductCard';
import type { IProductResponse } from "@/lib/admin_api/get-products";
import type { IBusiness } from "@/types/business";

type ProductGridProps = {
  products: IProductResponse[];
  businesses: IBusiness[];
  totalCount: number;
  query: string;
  stockFilter: string;
};

const getProductBusiness = (
  product: IProductResponse,
  businessList: IBusiness[],
): IBusiness | undefined => {
  return businessList.find((business) => business.id === product.businessId);
};

export default function ProductGrid({
  products,
  businesses: businessList,
  totalCount,
  query,
  stockFilter,
}: ProductGridProps) {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          Showing <span className="font-bold text-foreground">{products.length}</span> of {totalCount} products
        </p>
        {(query || stockFilter !== 'all') && (
          <Link href="/products" className="text-xs font-medium text-primary hover:underline">
            Reset filters
          </Link>
        )}
      </div>

      {products.length === 0 ? (
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
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              business={getProductBusiness(product, businessList)}
            />
          ))}
        </div>
      )}
    </>
  );
}