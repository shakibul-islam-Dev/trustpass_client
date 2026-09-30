import businesses from '@/public/data/businessCard.json';
import BusinessCard from './BusinessCard';

type Business = (typeof businesses)[number];

type BusinessResultsProps = {
  businesses: Business[];
  getBusinessHref: (business: Business) => string;
};

export default function BusinessResults({
  businesses: results,
  getBusinessHref,
}: BusinessResultsProps) {
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