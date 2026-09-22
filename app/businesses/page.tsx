import businesses from '@/public/data/businesses.json';
type Business = (typeof businesses)[number];
type BusinessesPageProps = {
  searchParams: Promise<{
    query?: string;
    category?: string;
    minScore?: string;
  }>;
};

const categoryAliases: Record<string, string[]> = {
  software: ['software', 'software-saas'],
  'software-saas': ['software', 'software-saas'],
  ecommerce: ['ecommerce', 'ecommerce-retail'],
  'ecommerce-retail': ['ecommerce', 'ecommerce-retail'],
  fintech: ['fintech', 'financial-services'],
  'financial-services': ['fintech', 'financial-services'],
  healthcare: ['healthcare', 'healthcare-wellness'],
  'healthcare-wellness': ['healthcare', 'healthcare-wellness'],
};

function filterBusinesses(
  records: Business[],
  query: string,
  category: string,
  minScore: number,
) {
  const categoryValues = categoryAliases[category] ?? [category];
  const normalizedQuery = query.toLowerCase();

  return records.filter((business) => {
    const matchesQuery = normalizedQuery
      ? `${business.name} ${business.description}`
          .toLowerCase()
          .includes(normalizedQuery)
      : true;
    const matchesCategory = category
      ? [business.category, ...business.aliases].some((value) =>
          categoryValues.includes(value),
        )
      : true;

    return matchesQuery && matchesCategory && business.trustScore >= minScore;
  });
}

export default async function BusinessesPage({
  searchParams,
}: BusinessesPageProps) {
  const params = await searchParams;
  const query = params.query?.trim() ?? '';
  const category = params.category?.toLowerCase() ?? '';
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
                className="rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-semibold">{business.name}</h2>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    {business.trustScore} Trust
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {business.description}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
