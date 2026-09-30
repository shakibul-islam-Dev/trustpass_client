type BusinessFiltersProps = {
  query: string;
  categoryOptions: string[];
  selectedCategoryValue: string;
  minScore: number;
  slugify: (text: string) => string;
};

export default function BusinessFilters({
  query,
  categoryOptions,
  selectedCategoryValue,
  minScore,
  slugify,
}: BusinessFiltersProps) {
  return (
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
  );
}