import PricingPlans from "@/components/pricing/PricingPlans";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Pricing",
  "Start free with up to 5 product listings. Upgrade to Pro on TrustPass and list as much as you want.",
);

export default function PricingPage() {
  return <PricingPlans />;
}
