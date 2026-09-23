'use client';
import Link from 'next/link';
import categoriesData from '@/public/data/categories.json';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  count: number;
}
export default function Categories() {
  const categories: Category[] = categoriesData;

  return (
    <section className="bg-background py-12 text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Directory Exploration
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Browse by Industry
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Select a category to view vetted vendors and certified businesses.
            </p>
          </div>
          <Link
            href="/businesses"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:text-primary/80 sm:mt-0"
          >
            View all categories &rarr;
          </Link>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/businesses?category=${cat.slug}`}
              className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-muted p-2 text-3xl transition group-hover:bg-primary/10">
                    {cat.icon}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary">
                    {cat.count} listings
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-card-foreground transition group-hover:text-primary">
                  {cat.name}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 flex items-center border-t border-border pt-3 text-xs font-medium text-muted-foreground transition group-hover:text-primary">
                <span>Explore category</span>
                <svg className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}