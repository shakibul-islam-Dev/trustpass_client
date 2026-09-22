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
    <section className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Directory Exploration
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Browse by Industry
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a category to view vetted vendors and certified businesses.
            </p>
          </div>
          <Link
            href="/businesses"
            className="mt-4 sm:mt-0 text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition"
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
              className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2 rounded-lg bg-slate-50 group-hover:bg-blue-50 transition">
                    {cat.icon}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition">
                    {cat.count} listings
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900 group-hover:text-blue-600 transition">
                  {cat.name}
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-medium text-slate-400 group-hover:text-blue-600 transition">
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