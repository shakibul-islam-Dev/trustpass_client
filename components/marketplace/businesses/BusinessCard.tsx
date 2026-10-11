import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, Store } from 'lucide-react';
import type { IBusiness } from '@/types/business';

type BusinessCardProps = {
  business: IBusiness;
  href: string;
};

export default function BusinessCard({ business, href }: BusinessCardProps) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-2xl border border-border/80 bg-card text-inherit no-underline shadow-sm transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none visited:text-inherit"
    >
      <div className="relative h-36 overflow-hidden bg-linear-to-br from-emerald-950 via-teal-800 to-slate-900">
        {business.coverUrl ? (
          <Image
            src={business.coverUrl}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
          />
        ) : (
          <>
            <div className="absolute -right-8 -top-16 size-48 rounded-full border border-white/15 bg-white/5 transition-transform duration-700 group-hover:scale-110 motion-reduce:transition-none" />
            <div className="absolute -bottom-24 left-1/3 size-52 rounded-full border border-white/15 bg-teal-300/10 transition-transform duration-700 group-hover:scale-110 motion-reduce:transition-none" />
            <Store className="absolute right-6 top-6 size-10 text-white/25" aria-hidden="true" />
          </>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-black/10" />
        <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
          {business.businessType.toLowerCase()}
        </div>
        {business.isFeatured && (
          <div className="absolute right-4 top-4 rounded-full border border-amber-200/40 bg-amber-400/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-950 shadow-sm">
            Featured
          </div>
        )}
      </div>

      <div className="relative px-5 pb-5">
        <div className="-mt-9 mb-3 flex items-end justify-between gap-3">
          {business.logoUrl ? (
            <Image
              src={business.logoUrl}
              alt={`${business.name} logo`}
              width={64}
              height={64}
              unoptimized
              className="size-16 rounded-2xl border-4 border-card bg-card object-cover shadow-md transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
            />
          ) : (
            <div
              className="flex size-16 items-center justify-center rounded-2xl border-4 border-card bg-primary text-xl font-bold text-primary-foreground shadow-md transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
              aria-label={`${business.name} logo`}
            >
              {business.name.trim().charAt(0).toUpperCase() || <Store className="size-6" aria-hidden="true" />}
            </div>
          )}
          <span className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary">
            <BadgeCheck className="size-3.5" aria-hidden="true" />
            {business.trustScore} Trust
          </span>
        </div>

        <div className="flex min-h-14 items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
              {business.name}
            </h2>
            <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
              {business.description || 'A trusted business on TrustPass.'}
            </p>
          </div>
          <ArrowUpRight
            className="mt-1 size-5 shrink-0 text-muted-foreground transition-[color,transform] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary motion-reduce:transition-none"
            aria-hidden="true"
          />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3 text-xs">
          <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground">
            <span className={`size-2 rounded-full ${business.verificationStatus === 'VERIFIED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {business.verificationStatus.replaceAll('_', ' ').toLowerCase()}
          </span>
          <span className="font-semibold text-primary">View profile</span>
        </div>
      </div>
    </Link>
  );
}