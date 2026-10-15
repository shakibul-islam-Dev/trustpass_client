import type { Metadata } from "next";
import SearchHero from "@/components/marketplace/SearchHero";
import Categories from "@/components/marketplace/Categories";
import HomeTrustGuide from "@/components/marketplace/HomeTrustGuide";
import { getCategories } from "@/lib/categories-api";
import HowItWorks from "@/components/home/HowItWorks";
import WhyTrustPass from "@/components/home/WhyTrustPass";
import CTABanner from "@/components/home/CTABanner";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const response = await getCategories();
  const categories = response.success && Array.isArray(response.data)
    ? response.data.filter((category) => category.isActive === true)
    : [];
  const error = response.success ? undefined : response.error;

  return (
    <div>
      <SearchHero categories={categories} />
      <HomeTrustGuide />
      <Categories categories={categories} error={error} />
      <HowItWorks />
      <WhyTrustPass />
      <CTABanner />
    </div>
  );
}
