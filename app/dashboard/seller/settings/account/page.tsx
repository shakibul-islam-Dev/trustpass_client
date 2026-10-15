import SellerAccountSettings from "@/components/seller/SellerAccountSettings";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Account Settings",
  "Manage your TrustPass seller account settings.",
);

export default function SellerAccountSettingsPage() {
  return <SellerAccountSettings />;
}