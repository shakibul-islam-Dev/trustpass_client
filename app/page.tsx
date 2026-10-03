import SearchHero from "@/components/marketplace/SearchHero";
import Categories from "@/components/marketplace/Categories";
import { getCategories } from "@/lib/categories-api";

export default async function Home() {
  const response = await getCategories();
  const categories = response.success && Array.isArray(response.data) ? response.data : [];
  const error = response.success ? undefined : response.error;

  return (
    <div>
      <SearchHero categories={categories} />
      <Categories categories={categories} error={error} />
    </div>
  );
}
