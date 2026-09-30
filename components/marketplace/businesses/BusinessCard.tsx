import Image from 'next/image';
import Link from 'next/link';
import businesses from '@/public/data/businessCard.json';

type Business = (typeof businesses)[number];

type BusinessCardProps = {
  business: Business;
  href: string;
};

export default function BusinessCard({ business, href }: BusinessCardProps) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 no-underline text-inherit visited:text-inherit"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {business.logo_url ? (
            <Image
              src={business.logo_url}
              alt={business.business_name}
              width={40}
              height={40}
              unoptimized
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {business.business_name.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {business.business_type}
            </p>
            <h2 className="mt-1 font-semibold">{business.business_name}</h2>
          </div>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
          {business.trust_score} Trust
        </span>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">{business.description}</p>

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span className="capitalize">{business.verification_status}</span>
        <span>View profile</span>
      </div>
    </Link>
  );
}