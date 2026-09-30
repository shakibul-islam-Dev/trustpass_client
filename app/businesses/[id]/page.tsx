'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import businesses from '@/public/data/businessCard.json';
import productDetails from '@/public/data/productDetails.json';
import { slugify } from '@/app/businessesExplore/page';
import { Globe, Mail, Phone, Package, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import Image from 'next/image';

type Business = (typeof businesses)[number];

const getTrustSummary = (score: number) => {
  if (score >= 90) return 'Excellent trust record';
  if (score >= 75) return 'Strong reputation';
  if (score >= 60) return 'Growing credibility';
  return 'Needs more verification';
};

const getBusinessHighlights = (business: Business) => [
  `${business.business_type} verified listing`,
  'Moderation reviewed profile',
  'Transparent trust scoring',
  'Responsive customer communication',
];

export default function BusinessProfilePage({
  params,
}: {
  params: Promise<{ id?: string; slug?: string }>;
}) {
  const resolvedParams = use(params);
  const identifier = (resolvedParams.slug || resolvedParams.id || '').toLowerCase().trim();
  const business = businesses.find(
    (b) =>
      slugify(b.business_name) === identifier ||
      String(b.id) === identifier ||
      (b as { slug?: string }).slug === identifier,
  );

  return <BusinessProfilePageContent business={business} />;
}

function BusinessProfilePageContent({
  business,
}: {
  business: Business | undefined;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [coverError, setCoverError] = useState(false);
  const INITIAL_ITEMS = 4;

  if (!business) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Business not found</h1>
        <Link href="/businesses" className="mt-4 inline-block text-primary hover:underline">
          Back to directory
        </Link>
      </main>
    );
  }

  const highlights = getBusinessHighlights(business);
  const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Verified', value: 'verified' },
    { label: 'Rejected', value: 'rejected' },
  ];
  const activeStatus = String(business.verification_status ?? 'pending').toLowerCase();

  const matchingProducts = productDetails.filter(
    (product) =>
      product.business_id === business.owner_id ||
      String(product.business_id) === String(business.id) ||
      product.category_id === business.category_id,
  );
  const products = matchingProducts.length > 0 ? matchingProducts : productDetails;
  const displayedProducts = isExpanded ? products : products.slice(0, INITIAL_ITEMS);

  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link href="/businesses" className="text-sm font-medium text-primary hover:underline">
          ← Back to directory
        </Link>

        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm mt-5">
          <div className="relative h-64 w-full bg-gradient-to-r from-primary/20 via-secondary/20 to-background">
            {business.cover_url && !coverError ? (
              <Image
                src={business.cover_url}
                alt={business.business_name}
                fill
                priority
                onError={() => setCoverError(true)}
                className="object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
            <div className="absolute bottom-6 left-6 flex items-center gap-4">
              {business.logo_url && !logoError ? (
                <Image
                  src={business.logo_url}
                  alt={business.business_name}
                  width={78}
                  height={78}
                  unoptimized
                  onError={() => setLogoError(true)}
                  className="h-[78px] w-[78px] rounded-full border-4 border-card bg-card object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-[78px] w-[78px] items-center justify-center rounded-full border-4 border-card bg-primary/10 text-2xl font-bold text-primary shadow-lg">
                  {business.business_name.charAt(0)}
                </div>
              )}
              <div className="text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-white/80">{business.business_type}</p>
                <h1 className="mt-1 text-3xl font-bold">{business.business_name}</h1>
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-6 lg:grid-cols-[1.7fr_0.9fr]">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background/60 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Trust score</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-3xl font-bold text-primary">{business.trust_score}</span>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {getTrustSummary(business.trust_score)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => {
                    const isActive = activeStatus === status.value;
                    const style = isActive
                      ? status.value === 'verified'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                        : status.value === 'pending'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-600'
                          : 'border-red-500 bg-red-500/10 text-red-600'
                      : 'border-border bg-muted text-muted-foreground';

                    return (
                      <span
                        key={status.value}
                        className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${style}`}
                      >
                        {status.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/40 p-5">
                <h2 className="text-xl font-semibold">About this business</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{business.description}</p>
              </div>

              <div className="rounded-2xl border border-border bg-background/40 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold">Highlights</h2>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Verified</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {highlights.map((item) => (
                    <div key={item} className="rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
                      • {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Products & Services Section */}
              <div className="rounded-2xl border border-border bg-background/40 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Products & Services</h2>
                      <p className="text-xs text-muted-foreground">
                        Verified offerings from {business.business_name}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {products.length} {products.length === 1 ? 'Product' : 'Products'}
                  </span>
                </div>

                <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                  {displayedProducts.map((product) => {
                    const primaryImage =
                      product.images?.find((img) => img.is_primary)?.url ??
                      product.images?.[0]?.url ??
                      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80';
                    const inStock = typeof product.stock === 'number' && product.stock > 0;

                    return (
                      <div
                        key={product.id}
                        className="group flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-3 transition-all duration-200 hover:border-primary/50 hover:shadow-sm"
                      >
                        <div className="relative h-32 w-full overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={primaryImage}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, 50vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <span
                            className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-xs ${
                              inStock
                                ? 'bg-emerald-500/90 text-white'
                                : 'bg-muted/90 text-muted-foreground'
                            }`}
                          >
                            {inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>

                        <div className="mt-2.5 flex flex-1 flex-col justify-between">
                          <div>
                            <h3
                              title={product.name}
                              className="text-sm font-semibold text-foreground line-clamp-1 transition-colors group-hover:text-primary"
                            >
                              {product.name}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                              {product.description}
                            </p>
                          </div>

                          <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2">
                            <div>
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Price</span>
                              <p className="text-sm font-bold text-primary">
                                {product.currency === 'USD' ? '$' : ''}
                                {Number(product.price).toFixed(2)}
                              </p>
                            </div>

                            <Link
                              href={`/products/${product.slug || product.id}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                            >
                              <span>View</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {products.length > INITIAL_ITEMS && (
                  <div className="mt-4 flex justify-center border-t border-border/40 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-foreground shadow-xs transition-colors hover:border-primary/50 hover:bg-muted focus:outline-none"
                    >
                      {isExpanded ? (
                        <>
                          <span>Show Less</span>
                          <ChevronUp className="h-3.5 w-3.5" />
                        </>
                      ) : (
                        <>
                          <span>See More ({products.length - INITIAL_ITEMS} remaining)</span>
                          <ChevronDown className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-border bg-background/70 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Contact information
                </h3>
                <ul className="mt-4 flex flex-wrap items-center gap-3">
                  {business.contact_phone ? (
                    <li>
                      <Link
                        href={`tel:${business.contact_phone}`}
                        aria-label="Call business"
                        title="Call business"
                        className="text-xl text-emerald-600 transition-opacity hover:opacity-70"
                      >
                        <Phone aria-hidden="true" size={20} strokeWidth={2} />
                      </Link>
                    </li>
                  ) : null}
                  {business.contact_email ? (
                    <li>
                      <Link
                        href={`mailto:${business.contact_email}`}
                        aria-label="Email business"
                        title="Email business"
                        className="text-xl text-rose-500 transition-opacity hover:opacity-70"
                      >
                        <Mail aria-hidden="true" size={20} strokeWidth={2} />
                      </Link>
                    </li>
                  ) : null}
                  {business.website_url ? (
                    <li>
                      <Link
                        href={business.website_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Visit business website"
                        title="Visit business website"
                        className="text-xl text-sky-600 transition-opacity hover:opacity-70"
                      >
                        <Globe aria-hidden="true" size={20} strokeWidth={2} />
                      </Link>
                    </li>
                  ) : null}
                  {business.insta_url ? (
                    <li>
                      <Link
                        href={business.insta_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Visit Instagram profile"
                        title="Visit Instagram profile"
                        className="text-xl transition-opacity hover:opacity-70"
                      >
                        <svg
                          aria-hidden="true"
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <defs>
                            <linearGradient id="instagram-gradient" x1="2" y1="22" x2="22" y2="2">
                              <stop offset="0%" stopColor="#feda75" />
                              <stop offset="35%" stopColor="#d62976" />
                              <stop offset="70%" stopColor="#962fbf" />
                              <stop offset="100%" stopColor="#4f5bd5" />
                            </linearGradient>
                          </defs>
                          <rect width="20" height="20" x="2" y="2" rx="5" stroke="url(#instagram-gradient)" />
                          <circle cx="12" cy="12" r="4" stroke="url(#instagram-gradient)" />
                          <circle cx="17.5" cy="6.5" r=".5" fill="#d62976" stroke="#d62976" />
                        </svg>
                      </Link>
                    </li>
                  ) : null}
                  {business.tiktok_url ? (
                    <li>
                      <Link
                        href={business.tiktok_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Visit TikTok profile"
                        title="Visit TikTok profile"
                        className="text-xl text-black transition-opacity hover:opacity-70 dark:text-white"
                      >
                        <svg
                          aria-hidden="true"
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path fill="#25f4ee" transform="translate(-0.7 0)" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.68-1.66.16-.29.28-.61.29-.95.07-1.68.04-3.36.05-5.04.01-3.79-.01-7.56.02-11.33z" />
                          <path fill="#fe2c55" transform="translate(0.7 0)" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.68-1.66.16-.29.28-.61.29-.95.07-1.68.04-3.36.05-5.04.01-3.79-.01-7.56.02-11.33z" />
                          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.68-1.66.16-.29.28-.61.29-.95.07-1.68.04-3.36.05-5.04.01-3.79-.01-7.56.02-11.33z" />
                        </svg>
                      </Link>
                    </li>
                  ) : null}
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-background/70 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Business overview
                </h3>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-card p-3">
                    <span>Category</span>
                    <strong className="text-foreground">{business.business_type}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-card p-3">
                    <span>Trust score</span>
                    <strong className="text-foreground">{business.trust_score}/100</strong>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-card p-3">
                    <span>Verification</span>
                    <strong className="capitalize text-foreground">{business.verification_status}</strong>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
