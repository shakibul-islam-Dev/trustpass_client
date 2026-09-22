import Link from 'next/link';
import businesses from '@/public/data/businessCard.json';

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
  params: Promise<{ id: string }>;
}) {
  const getBusiness = async () => {
    const resolvedParams = await params;
    return businesses.find((business) => String(business.id) === resolvedParams.id);
  };

  return <BusinessProfilePageContent getBusiness={getBusiness} />;
}

async function BusinessProfilePageContent({
  getBusiness,
}: {
  getBusiness: () => Promise<(typeof businesses)[number] | undefined>;
}) {
  const business = await getBusiness();

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

  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link href="/businesses" className="text-sm font-medium text-primary hover:underline">
          ← Back to directory
        </Link>

        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="relative h-64 w-full bg-gradient-to-r from-primary/20 via-secondary/20 to-background">
            {business.cover_url ? (
              <img
                src={business.cover_url}
                alt={business.business_name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
            <div className="absolute bottom-6 left-6 flex items-center gap-4">
              {business.logo_url ? (
                <img
                  src={business.logo_url}
                  alt={business.business_name}
                  className="h-[78px] w-[78px] rounded-full border-4 border-white bg-white object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-[78px] w-[78px] items-center justify-center rounded-full border-4 border-white bg-primary/10 text-2xl font-bold text-primary shadow-lg">
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
                <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold capitalize text-emerald-600">
                  {business.verification_status}
                </span>
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

            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-border bg-background/70 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Contact information
                </h3>
                <ul className="mt-4 space-y-3 text-sm">
                  {business.contact_phone ? <li>📞 {business.contact_phone}</li> : null}
                  {business.contact_email ? <li>✉️ {business.contact_email}</li> : null}
                  {business.website_url ? <li>🌐 {business.website_url}</li> : null}
                  {business.insta_url ? <li>📷 {business.insta_url}</li> : null}
                  {business.tiktok_url ? <li>🎵 {business.tiktok_url}</li> : null}
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
