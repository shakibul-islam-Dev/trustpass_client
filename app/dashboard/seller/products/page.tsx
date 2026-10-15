import SellerProductCatalog from "@/components/seller/SellerProductCatalog";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "My Products",
  "Manage the products listed for your TrustPass business.",
);

export default function SellerProductsPage() {
  return <SellerProductCatalog />;
}