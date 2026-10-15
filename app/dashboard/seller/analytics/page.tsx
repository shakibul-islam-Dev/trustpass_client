import SellerAnalytics from "@/components/seller/SellerAnalytics";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Seller Analytics",
  "Review activity and performance analytics for your TrustPass business.",
);

export default function SellerAnalyticsPage() {
  return <SellerAnalytics />;
}
