import Link from "next/link";
import businesses from "@/public/data/businessCard.json";
import Image from "next/image";

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
  ecommerce: ["ecommerce", "ecommerce & retail", "retail"],
  fintech: ["fintech", "financial services", "finance"],
  healthcare: ["healthcare", "healthcare & wellness", "pharmacy"],
  restaurant: ["restaurant", "food & beverage"],
  education: ["education", "academic"],
  marketing: ["digital marketing", "marketing"],
  fashion: ["fashion & clothing", "fashion"],
  construction: ["construction", "engineering"],
  hotel: ["hotel & accommodation", "hotel"],
  electronics: ["electronics & repair", "electronics"],
  grocery: ["grocery"],
};

const categoryOptions = Array.from(
  new Set(businesses.map((business) => business.business_type)),
).sort();

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

        {/* Filter Card */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <form className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Search
              </label>
              <input
                defaultValue={query}
                name="query"
                placeholder="Business name"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="md:col-span-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Category
              </label>
              <select
                defaultValue={selectedCategoryValue}
                key={selectedCategoryValue}
                name="category"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">All categories</option>
                {categoryOptions.map((item) => (
                  <option key={item} value={slugify(item)}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Min Trust
              </label>
              <select
                defaultValue={String(minScore)}
                name="minScore"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="0">Any</option>
                <option value="60">60+</option>
                <option value="75">75+</option>
                <option value="90">90+</option>
              </select>
            </div>

            <div className="md:col-span-4 mt-2 flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Apply filters
              </button>
            </div>
          </form>
        </div>

        {/* Category Tabs Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Browse by Category
            </h3>
            {category && (
              <Link
                href={getTabHref()}
                className="text-xs font-medium text-primary hover:underline"
              >
                Clear category filter
              </Link>
            )}
          </div>
          <div
            role="tablist"
            aria-label="Category tabs"
            className="flex items-center gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <Link
              role="tab"
              aria-selected={!category}
              href={getTabHref()}
              className={`inline-flex items-center gap-2 shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                !category
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              <span>All</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  !category
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {businesses.length}
              </span>
            </Link>
            {categoryOptions.map((catName) => {
              const catCount = businesses.filter(
                (b) => b.business_type === catName,
              ).length;
              const catSlug = slugify(catName);
              const isActive = isCategoryActive(catName, category);
              return (
                <Link
                  key={catName}
                  role="tab"
                  aria-selected={isActive}
                  href={getTabHref(catSlug)}
                  className={`inline-flex items-center gap-2 shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                      : "bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  <span>{catName}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {catCount}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {results.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-lg font-semibold">No businesses found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try another category, search term, location, or trust score.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((business) => (
              <Link
                key={business.id}
                href={`/businesses/${slugify(business.business_name)}`}
                className="block rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 no-underline text-inherit visited:text-inherit"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {business.logo_url ? (
                      <Image
                        src={business.logo_url}
                        alt={business.business_name}
                        width={40}
                        height={40}
                        unoptimized
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {business.business_name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {business.business_type}
                      </p>
                      <h2 className="mt-1 font-semibold">
                        {business.business_name}
                      </h2>
                    </div>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    {business.trust_score} Trust
                  </span>
                </div>

                <p className="mt-4 text-sm text-muted-foreground">
                  {business.description}
                </p>

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="capitalize">
                    {business.verification_status}
                  </span>
                  <span>View profile</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
