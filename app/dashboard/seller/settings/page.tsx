import SellerSettingsHub from "@/components/seller/SellerSettingsHub";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Seller Settings",
  "Manage your TrustPass business and seller account settings.",
);

export default function SellerSettingsPage() {
  return <SellerSettingsHub />;
}