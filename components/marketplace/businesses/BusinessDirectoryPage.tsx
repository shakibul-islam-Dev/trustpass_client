import Link from 'next/link';
import { getBusinesses } from '@/lib/business-api/all-business';
import type { IBusiness, TBusinessType, TVerificationStatus } from '@/types/business';
import BusinessFilters from './BusinessFilters';
import BusinessResults from './BusinessResults';

const businessTypes: TBusinessType[] = [
  'INDIVIDUAL',
  'COMPANY',
  'NGO',
  'GOVERNMENT',
  'OTHER',
];

const verificationStatuses: TVerificationStatus[] = [
  'UNVERIFIED',
  'PENDING',
  'VERIFIED',
  'REJECTED',
  'SUSPENDED',
];

type BusinessDirectoryProps = {
  searchParams: Promise<{
    query?: string;
    categoryId?: string;
    businessType?: string;
    verificationStatus?: string;
    page?: string;
  }>;
};

const getPageHref = (
  page: number,
  query: string,
  categoryId?: string,
  businessType?: TBusinessType,
  verificationStatus?: TVerificationStatus,
) => {
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  if (categoryId) params.set('categoryId', categoryId);
  if (businessType) params.set('businessType', businessType);
  if (verificationStatus) params.set('verificationStatus', verificationStatus);
  params.set('page', String(page));
  return `/businesses?${params.toString()}`;
};

export default async function BusinessDirectoryPage({
  searchParams,
}: BusinessDirectoryProps) {
  const params = await searchParams;
  const query = params.query?.trim() ?? '';
  const categoryId = params.categoryId?.trim() || undefined;
  const businessType = businessTypes.find((type) => type === params.businessType);
  const verificationStatus = verificationStatuses.find(
    (status) => status === params.verificationStatus,
  );
  const requestedPage = Number(params.page);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const response = await getBusinesses({
    page,
    limit: 10,
    search: query || undefined,
    categoryId,
    businessType,
    verificationStatus,
  });
  const businesses: IBusiness[] = response.success && Array.isArray(response.data)
    ? response.data
    : [];
  const totalPages = response.meta?.totalPage ?? 1;
  const error = response.success
    ? undefined
    : response.error || 'Please try again in a moment.';

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="text-sm font-semibold text-primary">TrustPass Directory</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Business directory</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {response.success
              ? `Showing ${businesses.length} of ${response.meta?.total ?? businesses.length} businesses.`
              : 'Business listings are temporarily unavailable.'}
          </p>
        </header>

        <BusinessFilters
          query={query}
          categoryId={categoryId}
          businessType={businessType}
          verificationStatus={verificationStatus}
        />

        <BusinessResults
          businesses={businesses}
          error={error}
          getBusinessHref={(business) => `/businesses/${business.slug || business.id}`}
        />

        {response.success && totalPages > 1 && (
          <nav aria-label="Business pages" className="mt-8 flex items-center justify-between">
            {page > 1 ? (
              <Link
                href={getPageHref(page - 1, query, categoryId, businessType, verificationStatus)}
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                Previous
              </Link>
            ) : <span />}
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            {page < totalPages ? (
              <Link
                href={getPageHref(page + 1, query, categoryId, businessType, verificationStatus)}
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                Next
              </Link>
            ) : <span />}
          </nav>
        )}
      </div>
    </main>
  );
}