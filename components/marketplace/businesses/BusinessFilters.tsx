import type { TBusinessType, TVerificationStatus } from '@/types/business';

type BusinessFiltersProps = {
  query: string;
  categoryId?: string;
  businessType?: TBusinessType;
  verificationStatus?: TVerificationStatus;
};

export default function BusinessFilters({
  query,
  categoryId,
  businessType,
  verificationStatus,
}: BusinessFiltersProps) {
  return (
    <div className="mb-8 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <form action="/businesses" className="grid gap-4 md:grid-cols-4">
        {categoryId && <input type="hidden" name="categoryId" value={categoryId} />}
        <div className="md:col-span-1">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Search
          </label>
          <input
            defaultValue={query}
            name="query"
            placeholder="Business name"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <div className="md:col-span-1">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Business type
          </label>
          <select
            defaultValue={businessType ?? 'all'}
            name="businessType"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">All types</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="COMPANY">Company</option>
            <option value="NGO">NGO</option>
            <option value="GOVERNMENT">Government</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Verification
          </label>
          <select
            defaultValue={verificationStatus ?? 'all'}
            name="verificationStatus"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">All statuses</option>
            <option value="UNVERIFIED">Unverified</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        <div className="md:col-span-4 mt-2 flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Apply filters
          </button>
        </div>
      </form>
    </div>
  );
}