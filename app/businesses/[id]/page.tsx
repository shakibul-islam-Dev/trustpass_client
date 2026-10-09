import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Camera, Globe, Mail, MapPin, Music2, Phone } from 'lucide-react';
import {
  getBusinessById,
  getBusinessBySlug,
} from '@/lib/business-api/all-business';
import { CustomerReportFormModal } from '@/components/customer/report-management/CustomerReportFormModal';
import type { IBusiness } from '@/types/business';

type BusinessProfileProps = {
  params: Promise<{ id: string }>;
};

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const formatLabel = (value: string) =>
  value.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export default async function BusinessProfilePage({ params }: BusinessProfileProps) {
  const { id: identifier } = await params;
  const response = isUuid(identifier)
    ? await getBusinessById(identifier)
    : await getBusinessBySlug(identifier);
  const business: IBusiness | undefined = response.success ? response.data : undefined;

  if (!business) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">
          {response.statusCode === 404 ? 'Business not found' : 'Business profile is unavailable'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {response.error || 'This business may have been removed or the link may be incorrect.'}
        </p>
        <Link href="/businesses" className="mt-4 inline-block text-primary hover:underline">
          Back to directory
        </Link>
      </main>
    );
  }

  const statusClasses: Record<string, string> = {
    VERIFIED: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    PENDING: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    REJECTED: 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300',
    SUSPENDED: 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300',
    UNVERIFIED: 'border-border bg-muted text-muted-foreground',
  };
  const trustScore = Math.min(100, Math.max(0, business.trustScore));
  const trustScoreColor = trustScore >= 70
    ? '#10b981'
    : trustScore >= 40
      ? '#f59e0b'
      : '#f43f5e';

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-8 text-foreground sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/businesses" className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Directory
          </Link>
          <CustomerReportFormModal businessId={business.id} businessName={business.name} />
        </div>

        <article className="mt-5 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="relative h-64 bg-linear-to-br from-emerald-950 via-teal-900 to-slate-900 sm:h-80">
            {business.coverUrl && (
              <Image
                src={business.coverUrl}
                alt={`${business.name} cover`}
                fill
                priority
                unoptimized
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-5 sm:p-8">
              {business.logoUrl ? (
                <Image
                  src={business.logoUrl}
                  alt={`${business.name} logo`}
                  width={76}
                  height={76}
                  unoptimized
                  className="h-20 w-20 rounded-2xl border-2 border-white/80 bg-white object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-white/80 bg-primary text-2xl font-bold text-primary-foreground shadow-lg">
                  {business.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
                  {formatLabel(business.businessType)}
                </p>
                <h1 className="mt-1 text-2xl font-bold sm:text-4xl">{business.name}</h1>
                {business.address && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-white/80">
                    <MapPin className="size-4 shrink-0" aria-hidden="true" />
                    {business.address.city}, {formatLabel(business.address.division)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-7">
              <section className="flex flex-wrap items-center gap-2.5 border-b border-border pb-6">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClasses[business.verificationStatus] ?? statusClasses.UNVERIFIED}`}>
                  <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                  {formatLabel(business.verificationStatus)}
                </span>
                {business.isFeatured && (
                  <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    Featured
                  </span>
                )}
              </section>

              <section className="flex flex-col items-center gap-5 border-y border-border py-6 sm:flex-row sm:items-center">
                <div
                  className="size-36 shrink-0 rounded-full p-2.25"
                  role="meter"
                  aria-label="Trust score"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={trustScore}
                  style={{
                    background: `conic-gradient(from -90deg, ${trustScoreColor} 0deg ${trustScore * 3.6}deg, var(--muted) ${trustScore * 3.6}deg 360deg)`,
                  }}
                >
                  <div className="flex size-full flex-col items-center justify-center rounded-full bg-card">
                    <span className="text-4xl font-bold tabular-nums" style={{ color: trustScoreColor }}>{trustScore}</span>
                    <span className="mt-0.5 text-xs font-medium text-muted-foreground">of 100</span>
                  </div>
                </div>
                <div className="w-full flex-1 text-center sm:text-left">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">TrustPass score</p>
                  <h2 className="mt-1 text-lg font-semibold">Trust score</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {trustScore === 0
                      ? 'No trust score has been recorded yet.'
                      : 'This score summarizes the current trust rating for this business.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground" aria-label="Score color ranges">
                    <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-rose-500" aria-hidden="true" />0-39</span>
                    <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-500" aria-hidden="true" />40-69</span>
                    <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />70-100</span>
                  </div>
                </div>
              </section>

              <section className="border-t border-border pt-6">
                <h2 className="text-lg font-semibold">About this business</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                  {business.description || 'No business description provided.'}
                </p>
              </section>

              <section className="border-t border-border pt-6">
                <h2 className="text-lg font-semibold">Business address</h2>
                {business.address ? (
                  <address className="mt-3 flex items-start gap-3 not-italic text-sm leading-6 text-muted-foreground">
                    <MapPin className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>
                      {business.address.addressLine}<br />
                      {business.address.city}, {business.address.district}<br />
                      {formatLabel(business.address.division)} {business.address.postalCode}<br />
                      {formatLabel(business.address.country)}
                    </span>
                  </address>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">No address provided.</p>
                )}
              </section>
            </div>

            <aside className="space-y-4">
              <section className="rounded-xl border border-border bg-muted/20 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Contact information
                </h2>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {business.contactPhone && (
                    <a
                      aria-label={`Call ${business.name}`}
                      title="Call business"
                      href={`tel:${business.contactPhone}`}
                      className="flex size-11 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Phone className="size-5" aria-hidden="true" />
                    </a>
                  )}
                  {business.contactEmail && (
                    <a
                      aria-label={`Email ${business.name}`}
                      title="Email business"
                      href={`mailto:${business.contactEmail}`}
                      className="flex size-11 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Mail className="size-5" aria-hidden="true" />
                    </a>
                  )}
                  {business.websiteUrl && (
                    <a
                      aria-label={`Visit ${business.name} website`}
                      title="Visit website"
                      href={business.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex size-11 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Globe className="size-5" aria-hidden="true" />
                    </a>
                  )}
                  {business.instaUrl && (
                    <a
                      aria-label={`${business.name} on Instagram`}
                      title="Open Instagram"
                      href={business.instaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex size-11 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:border-fuchsia-500/50 hover:bg-fuchsia-500/10 hover:text-fuchsia-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Camera className="size-5" aria-hidden="true" />
                    </a>
                  )}
                  {business.tiktokUrl && (
                    <a
                      aria-label={`${business.name} on TikTok`}
                      title="Open TikTok"
                      href={business.tiktokUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex size-11 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Music2 className="size-5" aria-hidden="true" />
                    </a>
                  )}
                  {!business.contactPhone && !business.contactEmail && !business.websiteUrl && !business.instaUrl && !business.tiktokUrl && (
                    <p className="text-sm text-muted-foreground">No contact information provided.</p>
                  )}
                </div>
              </section>

              <section className="rounded-xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Business overview
                </h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Type</dt><dd className="text-right font-medium">{formatLabel(business.businessType)}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Trust score</dt><dd className="font-medium">{business.trustScore}/100</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Verification</dt><dd className="text-right font-medium">{formatLabel(business.verificationStatus)}</dd></div>
                </dl>
              </section>

              <CustomerReportFormModal
                businessId={business.id}
                businessName={business.name}
              />
            </aside>
          </div>
        </article>
      </div>
    </main>
  );
}