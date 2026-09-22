import Link from 'next/link';
import businesses from '@/public/data/businessCard.json';

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
  value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const categoryAliases: Record<string, string[]> = {
  software: ['software', 'software & saas'],
  ecommerce: ['ecommerce', 'ecommerce & retail', 'retail'],
  fintech: ['fintech', 'financial services', 'finance'],
  healthcare: ['healthcare', 'healthcare & wellness', 'pharmacy'],
  restaurant: ['restaurant', 'food & beverage'],
  education: ['education', 'academic'],
  marketing: ['digital marketing', 'marketing'],
  fashion: ['fashion & clothing', 'fashion'],
  construction: ['construction', 'engineering'],
  hotel: ['hotel & accommodation', 'hotel'],
  electronics: ['electronics & repair', 'electronics'],
  grocery: ['grocery'],
};

const categoryOptions = Array.from(
  new Set(businesses.map((business) => business.business_type)),
).sort();

function filterBusinesses(
  records: Business[],
  query: string,
  category: string,
  minScore: number,
) {
  const normalizedQuery = query.toLowerCase();
  const categoryValues = categoryAliases[category] ?? [normalizeText(category)];

  return records.filter((business) => {
    const queryText = `${business.business_name} ${business.description} ${business.business_type}`.toLowerCase();
    const normalizedBusinessType = normalizeText(business.business_type);
    const matchesQuery = normalizedQuery ? queryText.includes(normalizedQuery) : true;
    const matchesCategory = category
      ? categoryValues.some(
          (value) =>
            normalizedBusinessType.includes(value) || value.includes(normalizedBusinessType),
        )
      : true;

    return matchesQuery && matchesCategory && business.trust_score >= minScore;
  });
}

export default async function BusinessesPage({ searchParams }: BusinessesPageProps) {
  const params = await searchParams;
  const query = params.query?.trim() ?? '';
  const category = params.category?.trim().toLowerCase() ?? '';
  const minScore = Number(params.minScore) || 0;
  const results = filterBusinesses(businesses, query, category, minScore);

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-primary">TrustPass Directory</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {category ? 'Businesses in this category' : 'All verified businesses'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {results.length} verified {results.length === 1 ? 'business' : 'businesses'} found.
          </p>
        </div>

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
                defaultValue={category}
                name="category"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">All categories</option>
                {categoryOptions.map((item) => (
                  <option key={item} value={normalizeText(item)}>
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
                href={`/businesses/${business.id}`}
                className="block rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 no-underline text-inherit visited:text-inherit"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {business.logo_url ? (
                      <img
                        src={business.logo_url}
                        alt={business.business_name}
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
                      <h2 className="mt-1 font-semibold">{business.business_name}</h2>
                    </div>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    {business.trust_score} Trust
                  </span>
                </div>

                <p className="mt-4 text-sm text-muted-foreground">{business.description}</p>

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="capitalize">{business.verification_status}</span>
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
