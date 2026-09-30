import Link from 'next/link';
import productDetails from '@/public/data/productDetails.json';
import businesses from '@/public/data/businessCard.json';
import ProductCard from './ProductCard';

type Product = (typeof productDetails)[number];
type Business = (typeof businesses)[number];

type ProductGridProps = {
  products: Product[];
  businesses: Business[];
  totalCount: number;
  query: string;
  stockFilter: string;
};

const getProductBusiness = (product: Product, businessList: Business[]): Business | undefined => {
  return businessList.find(
    (business) =>
      business.owner_id === product.business_id ||
      String(business.id) === product.business_id ||
      business.category_id === product.category_id,
  );
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