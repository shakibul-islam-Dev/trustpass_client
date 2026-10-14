import SellerAppearanceSettings from "@/components/seller/SellerAppearanceSettings";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Appearance Settings",
  "Customize the appearance of your TrustPass seller workspace.",
);

export default function SellerAppearanceSettingsPage() {
  return <SellerAppearanceSettings />;
}