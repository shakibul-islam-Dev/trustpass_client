import Image from "next/image";
import businesses from "@/public/data/businessCard.json";

type Business = (typeof businesses)[number];

type BusinessesPageProps = {
  searchParams: Promise<{
    query?: string;
    category?: string;
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

function filterBusinesses(
  records: Business[],
  query: string,
  category: string,
  minScore: number,
) {
  const normalizedQuery = query.toLowerCase();
  const categoryValues = categoryAliases[category] ?? [normalizeText(category)];

  return records.filter((business) => {
    const queryText =
      `${business.business_name} ${business.description} ${business.business_type}`.toLowerCase();
    const normalizedBusinessType = normalizeText(business.business_type);
    const matchesQuery = normalizedQuery
      ? queryText.includes(normalizedQuery)
      : true;
    const matchesCategory = category
      ? categoryValues.some(
          (value) =>
            normalizedBusinessType.includes(value) ||
            value.includes(normalizedBusinessType),
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

        {results.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-lg font-semibold">No businesses found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try another category, search term, or trust score.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((business) => (
              <article
                key={business.id}
                className="rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {business.logo_url ? (
                      <img
                        src={business.logo_url}
                        alt={business.business_name}
                        className="h-10 w-10 object-cover rounded-full"
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
                  {business.website_url ? (
                    <a
                      href={business.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      Visit site
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
