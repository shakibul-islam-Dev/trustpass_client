import type { IBusiness } from '@/types/business';
import BusinessCard from './BusinessCard';

type BusinessResultsProps = {
  businesses: IBusiness[];
  getBusinessHref: (business: IBusiness) => string;
  error?: string;
};

export default function BusinessResults({
  businesses: results,
  getBusinessHref,
  error,
}: BusinessResultsProps) {
  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-destructive/30 bg-card p-8 text-center">
        <h2 className="text-lg font-semibold">Businesses could not be loaded</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold">No businesses found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Try another category, search term, location, or trust score.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {results.map((business) => (
        <BusinessCard
          key={business.id}
          business={business}
          href={getBusinessHref(business)}
        />
      ))}
    </div>
  );
}