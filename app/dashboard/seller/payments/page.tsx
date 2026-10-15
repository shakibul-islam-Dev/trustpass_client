import SellerPayments from "@/components/seller/SellerPayments";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Trust Passport",
  "View and manage your payments on TrustPass.",
);
export default function SellerPaymentsPage(){
    return <SellerPayments />
}