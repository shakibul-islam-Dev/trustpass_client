import Link from 'next/link';

export default function CategorySectionHeader() {
  return (
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
  );
}