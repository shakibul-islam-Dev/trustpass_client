import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';
import { cache } from 'react';
import { getBusinessById, getBusinessBySlug } from '@/lib/business-api/all-business';
import { CustomerReportFormModal } from '@/components/customer/report-management/CustomerReportFormModal';
import type { IBusiness, IProduct } from '@/types/business';
import { BusinessHeader } from '@/components/business-details/BusinessHeader';
import { BusinessTrustScore } from '@/components/business-details/BusinessTrustScore';
import { BusinessProductList } from '@/components/business-details/BusinessProductList';
import { BusinessReportsList } from '@/components/business-details/BusinessReportsList';
import { BusinessContactInfo, BusinessOverview } from '@/components/business-details/BusinessSidebar';

type BusinessProfileProps = {
  params: Promise<{ id: string }>;
};

const isUuid = (val: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

const formatLabel = (val: string) =>
  val.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const getBusiness = cache(async (identifier: string) =>
  isUuid(identifier) ? getBusinessById(identifier) : getBusinessBySlug(identifier)
);

// Products fetch korar function
async function getBusinessProducts(businessId: string): Promise<IProduct[]> {
  try {
    const res = await fetch(`https://trust-pass-server.vercel.app/api/v1/businesses/${businessId}/products`, {
      cache: 'no-store'
    });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

export default async function BusinessProfilePage({ params }: BusinessProfileProps) {
  const { id: identifier } = await params;
  const response = await getBusiness(identifier);
  const business: IBusiness | undefined = response.success ? response.data : undefined;

  if (!business) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Profile Unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">Business not found.</p>
        <Link href="/businesses" className="mt-4 inline-block text-primary hover:underline text-sm font-semibold">
          Back to Directory
        </Link>
      </main>
    );
  }

  // Business product fetch
  const products = await getBusinessProducts(business.id);

  const trustScore = Math.min(100, Math.max(0, business.trustScore));
  const hasScore = business.trustScoreUpdatedAt != null;

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Directory Back Link */}
        <div>
          <Link
            href="/businesses"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to Directory
          </Link>
        </div>

        {/* Outer Card */}
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          {/* Header */}
          <BusinessHeader business={business} />

          {/* Grid Layout */}
          <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1.65fr_1fr]">
            
            {/* Left Content */}
            <div className="space-y-7">
              <BusinessTrustScore score={trustScore} hasScore={hasScore} />

              {/* About */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  About Business
                </h3>
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                  {business.description || 'No detailed background provided.'}
                </p>
              </div>

              {/* Location */}
              {business.address && (
                <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Registered Location
                  </h3>
                  <div className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      <span className="font-semibold text-foreground">{business.address.addressLine}</span>, {business.address.city}, {business.address.district} - {business.address.postalCode}, {formatLabel(business.address.division)}
                    </p>
                  </div>
                </div>
              )}

              {/* Products Grid */}
              <BusinessProductList products={products} />

              {/* Reports List */}
              <BusinessReportsList reports={business.reports} />
            </div>

            {/* Right Sidebar */}
            <aside className="space-y-4 lg:sticky lg:top-6 h-fit">
              <BusinessContactInfo business={business} />
              <BusinessOverview business={business} hasScore={hasScore} trustScore={trustScore} />
              
              <div className="pt-2">
                <CustomerReportFormModal
                  businessId={business.id}
                  businessName={business.name}
                />
              </div>
            </aside>
          </div>
        </div>

      </div>
    </main>
  );
}