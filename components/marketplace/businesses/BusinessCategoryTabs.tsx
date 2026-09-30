import Link from 'next/link';

type BusinessCategoryTabsProps = {
  category: string;
  categoryOptions: string[];
  categoryCounts: Map<string, number>;
  businessCount: number;
  getTabHref: (categorySlug?: string) => string;
  slugify: (text: string) => string;
  isCategoryActive: (categoryName: string, currentCategory: string) => boolean;
};

export default function BusinessCategoryTabs({
  category,
  categoryOptions,
  categoryCounts,
  businessCount,
  getTabHref,
  slugify,
  isCategoryActive,
}: BusinessCategoryTabsProps) {
  return (
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
        className="flex items-center gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        <Link
          role="tab"
          aria-selected={!category}
          href={getTabHref()}
          className={`inline-flex items-center gap-2 shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all ${
            !category
              ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
              : 'bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
          }`}
        >
          <span>All</span>
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] ${
              !category
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {businessCount}
          </span>
        </Link>
        {categoryOptions.map((categoryName) => {
          const categoryCount = categoryCounts.get(categoryName) ?? 0;
          const categorySlug = slugify(categoryName);
          const isActive = isCategoryActive(categoryName, category);

          return (
            <Link
              key={categoryName}
              role="tab"
              aria-selected={isActive}
              href={getTabHref(categorySlug)}
              className={`inline-flex items-center gap-2 shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                  : 'bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              <span>{categoryName}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  isActive
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {categoryCount}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}