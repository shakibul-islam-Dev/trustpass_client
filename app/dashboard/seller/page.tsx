import SellerDashboard from "@/components/seller/SellerDashboard";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Seller Dashboard",
  "Review your TrustPass business, products, and verification activity.",
);

export default function SellerDashboardPage() {
  return <SellerDashboard />;
}
