import businesses from "@/public/data/businessCard.json";
import categoriesData from "@/public/data/categories.json";
import BusinessCategoryTabs from "@/components/marketplace/businesses/BusinessCategoryTabs";
import BusinessFilters from "@/components/marketplace/businesses/BusinessFilters";
import BusinessResults from "@/components/marketplace/businesses/BusinessResults";

type Business = (typeof businesses)[number];

type BusinessesPageProps = {
  searchParams: Promise<{
    query?: string;
    category?: string;
    location?: string;
    minScore?: string;
  }>;
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const categoryAliases: Record<string, string[]> = {
  software: ["software", "software & saas"],
  "software-saas": ["software", "software & saas"],
  ecommerce: ["ecommerce", "ecommerce & retail", "retail"],
  "ecommerce-retail": ["ecommerce", "ecommerce & retail", "retail"],
  fintech: ["fintech", "financial services", "finance"],
  "financial-services": ["fintech", "financial services", "finance"],
  healthcare: ["healthcare", "healthcare & wellness", "pharmacy"],
  "healthcare-wellness": ["healthcare", "healthcare & wellness", "pharmacy"],
  restaurant: ["restaurant", "food & beverage"],
  education: ["education", "academic"],
  marketing: ["digital marketing", "marketing"],
  "marketing-creative": ["digital marketing", "marketing", "creative"],
  fashion: ["fashion & clothing", "fashion"],
  construction: ["construction", "engineering"],
  hotel: ["hotel & accommodation", "hotel"],
  electronics: ["electronics & repair", "electronics"],
  grocery: ["grocery"],
  "legal-compliance": ["legal", "compliance"],
  "logistics-supply": ["logistics", "supply"],
  "real-estate": ["real estate", "co-working", "coworking"],
};

const categoryOptions = categoriesData.map((category) => category.name).sort();
const categoryCounts = new Map(
  categoriesData.map((category) => [category.name, category.count]),
);

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const isCategoryActive = (
  catName: string,
  currentCategory: string,
): boolean => {
  if (!currentCategory) return false;
  const normalizedCurrent = currentCategory.toLowerCase();
  const normalizedCat = normalizeText(catName);
  const catSlug = slugify(catName);

  if (normalizedCurrent === normalizedCat || normalizedCurrent === catSlug)
    return true;

  const aliases = categoryAliases[normalizedCurrent];
  if (
    aliases &&
    aliases.some(
      (alias) => normalizedCat.includes(alias) || alias.includes(normalizedCat),
    )
  ) {
    return true;
  }
  return false;
};

function filterBusinesses(
  records: Business[],
  query: string,
  category: string,
  minScore: number,
) {
  const normalizedQuery = query.toLowerCase();
  const categorySlug = slugify(category);
  const normalizedCategory = normalizeText(category);
  const categoryValues = categoryAliases[category] ??
    categoryAliases[categorySlug] ??
    categoryAliases[normalizedCategory] ?? [normalizedCategory, categorySlug];

  return records.filter((business) => {
    const queryText =
      `${business.business_name} ${business.description} ${business.business_type}`.toLowerCase();
    const normalizedBusinessType = normalizeText(business.business_type);
    const businessSlug = slugify(business.business_type);
    const matchesQuery = normalizedQuery
      ? queryText.includes(normalizedQuery)
      : true;
    const matchesCategory = category
      ? isCategoryActive(business.business_type, category) ||
        categoryValues.some(
          (value) =>
            normalizedBusinessType.includes(value) ||
            value.includes(normalizedBusinessType) ||
            businessSlug.includes(value) ||
            value.includes(businessSlug),
        )
      : true;

    return matchesQuery && matchesCategory && business.trust_score >= minScore;
  });
}

export default async function BusinessesPage({
  searchParams,
}: BusinessesPageProps) {
  const params = await searchParams;
  const query = params.query?.trim() ?? "";
  const category = params.category?.trim().toLowerCase() ?? "";
  const minScore = Number(params.minScore) || 0;
  const results = filterBusinesses(businesses, query, category, minScore);

  const getTabHref = (catSlug?: string) => {
    const p = new URLSearchParams();
    if (query) p.set("query", query);
    if (catSlug) p.set("category", catSlug);
    if (minScore > 0) p.set("minScore", String(minScore));
    const qs = p.toString();
    return qs ? `/businesses?${qs}` : "/businesses";
  };

  const selectedCategoryValue = categoryOptions.find((item) =>
    isCategoryActive(item, category),
  )
    ? slugify(categoryOptions.find((item) => isCategoryActive(item, category))!)
    : "";

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-primary">
            TrustPass Directory
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {category
              ? "Businesses in this category"
              : "All verified businesses"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {results.length} verified{" "}
            {results.length === 1 ? "business" : "businesses"} found.
          </p>
        </div>

        <BusinessFilters
          query={query}
          categoryOptions={categoryOptions}
          selectedCategoryValue={selectedCategoryValue}
          minScore={minScore}
          slugify={slugify}
        />

        <BusinessCategoryTabs
          category={category}
          categoryOptions={categoryOptions}
          categoryCounts={categoryCounts}
          businessCount={businesses.length}
          getTabHref={getTabHref}
          slugify={slugify}
          isCategoryActive={isCategoryActive}
        />

        <BusinessResults
          businesses={results}
          getBusinessHref={(business) =>
            `/businesses/${slugify(business.business_name)}`
          }
        />
      </div>
    </main>
  );
}
