import Image from 'next/image';
import { MapPin, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import type { IBusiness } from '@/types/business';

const formatLabel = (value: string) =>
  value.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export function BusinessHeader({ business }: { business: IBusiness }) {
  const isVerified = business.verificationStatus === 'VERIFIED';

  return (
    <div className="w-full bg-card border-b border-border">
      {/* Cover Image container with standard height & aspect ratio */}
      <div className="relative w-full h-52 sm:h-72 md:h-80 bg-muted overflow-hidden">
        {business.coverUrl ? (
          <Image
            src={business.coverUrl}
            alt={`${business.name} cover`}
            fill
            priority
            unoptimized
            className="object-cover object-center w-full h-full"
          />
        ) : (
          <div className="size-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900" />
        )}
      </div>

      {/* Profile Bar (Logo + Info) with proper responsive negative margin */}
      <div className="px-5 sm:px-8 pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-14 sm:-mt-16">
          {/* Logo Card with solid border to fix blending issue */}
          <div className="relative size-28 sm:size-32 rounded-2xl border-4 border-card bg-card shadow-xl overflow-hidden shrink-0 z-10">
            {business.logoUrl ? (
              <Image
                src={business.logoUrl}
                alt={`${business.name} logo`}
                fill
                unoptimized
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-primary text-4jxl font-bold text-primary-foreground">
                {business.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Details & Badges */}
          <div className="flex-1 space-y-1.5 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                <Building2 className="size-3" />
                {formatLabel(business.businessType)}
              </span>

              {isVerified && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-500 border border-emerald-500/20">
                  <ShieldCheck className="size-3" />
                  Verified Profile
                </span>
              )}

              {business.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-500 border border-amber-500/20">
                  <Sparkles className="size-3" />
                  Featured
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {business.name}
            </h1>

            {business.address && (
              <p className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                <MapPin className="size-3.5 text-primary shrink-0" />
                <span>
                  {business.address.city}, {formatLabel(business.address.division)}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}