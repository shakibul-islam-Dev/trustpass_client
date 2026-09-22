'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CategoryQuickLink {
  name: string;
  slug: string;
  icon: string;
}

export default function SearchHero() {
  const router = useRouter();

  // Search filter states
  const [categories, setCategories] = useState<CategoryQuickLink[]>([]);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minTrustScore, setMinTrustScore] = useState(0);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/data/searchHero.json');
        if (!response.ok) {
          throw new Error(`Failed to load categories: ${response.status}`);
        }

        const data: CategoryQuickLink[] = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Unable to load search hero categories', error);
      }
    };

    loadCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Construct URL search query params
    const params = new URLSearchParams();
    if (keyword.trim()) params.append('query', keyword.trim());
    if (selectedCategory) params.append('category', selectedCategory);
    if (minTrustScore > 0) params.append('minScore', minTrustScore.toString());

    router.push(`/businesses?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-muted/70 to-background py-16 font-sans sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Headline & Value Proposition */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
            Verified Directory & Trust Scoring
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Find and Verify Businesses You Can <span className="text-primary">Trust</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Browse legitimate companies, inspect verified legal documentation, and review transparent Trust Scores before you do business.
          </p>
        </div>

        {/* Search & Filter Card */}
        <div className="mx-auto mt-10 max-w-4xl">
          <form
            onSubmit={handleSearch}
            className="rounded-2xl border border-border bg-card p-4 shadow-xl shadow-foreground/10 sm:p-5"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-3">
              
              {/* Keyword Input */}
              <div className="md:col-span-5">
                <label htmlFor="keyword" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Business Name or Keyword
                </label>
                <div className="relative">
                  <input
                    id="keyword"
                    type="text"
                    placeholder="e.g. Apex Logistics, Cloud Pay..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background py-2.5 pl-3 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="md:col-span-4">
                <label htmlFor="category" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-3 flex items-end">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </button>
              </div>

            </div>

            {/* Quick Filter: Trust Score Threshold */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Minimum Trust Score:</span>
                {[0, 60, 80, 90].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setMinTrustScore(score)}
                    className={`px-2.5 py-1 rounded-full border transition ${
                      minTrustScore === score
                        ? 'border-primary bg-primary/10 font-bold text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {score === 0 ? 'Any' : `${score}+`}
                  </button>
                ))}
              </div>

              <span className="hidden text-muted-foreground sm:inline">
                Verified listings reviewed by staff moderators
              </span>
            </div>
          </form>
        </div>

        {/* Category Navigation Quick Links */}
        <div className="mx-auto mt-8 max-w-4xl">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Popular Categories
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.slug}
                onClick={() => router.push(`/businesses?category=${category.slug}`)}
                className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition hover:border-primary/50 hover:text-primary"
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}