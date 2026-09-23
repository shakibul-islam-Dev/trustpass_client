import Link from 'next/link';
import businesses from '@/public/data/businessCard.json';

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

  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/businesses" className="text-sm font-medium text-primary hover:underline">
          ← Back to directory
        </Link>

        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="relative h-52 w-full bg-gradient-to-r from-primary/20 via-secondary/20 to-background">
            {business.cover_url ? (
              <img
                src={business.cover_url}
                alt={business.business_name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-5 left-5 flex items-center gap-4">
              {business.logo_url ? (
                <img
                  src={business.logo_url}
                  alt={business.business_name}
                  className="h-[72px] w-[72px] rounded-full border-4 border-white bg-white object-cover shadow-md"
                />
              ) : (
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white bg-primary/10 text-2xl font-bold text-primary shadow-md">
                  {business.business_name.charAt(0)}
                </div>
              )}
              <div className="text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-white/80">
                  {business.business_type}
                </p>
                <h1 className="mt-1 text-3xl font-bold">{business.business_name}</h1>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-[1.5fr_0.8fr]">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background/60 p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Trust score</p>
                  <p className="mt-2 text-2xl font-bold text-primary">{business.trust_score}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary capitalize">
                  {business.verification_status}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-semibold">About</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{business.description}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-1">
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Contact</p>
                  <p className="mt-2 font-medium">{business.contact_phone ?? 'Not available'}</p>
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border border-border bg-background/70 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Contact info
                </h3>
                <ul className="mt-4 space-y-2 text-sm">
                  {business.contact_email ? (
                    <li>📧 {business.contact_email}</li>
                  ) : null}
                  {business.website_url ? (
                    <li>🌐 {business.website_url}</li>
                  ) : null}
                  {business.insta_url ? (
                    <li>📷 {business.insta_url}</li>
                  ) : null}
                  {business.tiktok_url ? (
                    <li>🎵 {business.tiktok_url}</li>
                  ) : null}
                </ul>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
