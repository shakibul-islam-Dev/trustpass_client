type ProductCatalogFiltersProps = {
  query: string;
  stockFilter: string;
};

export default function ProductCatalogFilters({
  query,
  stockFilter,
}: ProductCatalogFiltersProps) {
  return (
    <div className="mb-8 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <form className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <label
            htmlFor="query"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Search Products
          </label>
          <input
            id="query"
            defaultValue={query}
            name="query"
            placeholder="Product name, keywords..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <div className="md:col-span-1">
          <label
            htmlFor="stock"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Availability
          </label>
          <select
            id="stock"
            defaultValue={stockFilter}
            name="stock"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">All Items</option>
            <option value="in_stock">In Stock Only</option>
          </select>
        </div>

        <div className="md:col-span-1 flex items-end">
          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Filter Catalog
          </button>
        </div>
      </form>
    </div>
  );
}