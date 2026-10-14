import SellerTrustPassport from "@/components/seller/SellerTrustPassport";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Trust Passport",
  "View and manage your business Trust Passport on TrustPass.",
);

export default function SellerTrustPassportPage() {
  return <SellerTrustPassport />;
}
