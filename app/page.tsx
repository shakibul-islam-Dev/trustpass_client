import SearchHero from "@/components/marketplace/SearchHero";
import Categories from "@/components/marketplace/Categories";
import HowItWorks from "@/components/home/HowItWorks";
import TrustStats from "@/components/home/TrustStats";
import WhyTrustPass from "@/components/home/WhyTrustPass";
import CTABanner from "@/components/home/CTABanner";
import { getCategories } from "@/lib/categories-api";

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
      <TrustStats />
      <Categories categories={categories} error={error} />
      <HowItWorks />
      <WhyTrustPass />
      <CTABanner />
    </div>
  );
}
