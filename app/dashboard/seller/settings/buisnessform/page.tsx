import BuisnessUpdateForm from "@/components/buisness/BuisnessUpdateForm";
import BusinessCreationForm from "@/components/buisness/BusinessCreationForm";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Business Profile",
  "Create or update your TrustPass business profile.",
);

/**
 * Business setup page for sellers.
 *
 * - No `id`  → create a new business (details, category, address, documents).
 * - With id  → edit that business:
 *     /dashboard/seller/settings/buisnessform?id=<businessId>
 */
export default async function BuisnessUpdateFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>;
}) {
  const params = await searchParams;
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!id) {
    return <BusinessCreationForm />;
  }

  return <BuisnessUpdateForm businessId={id} />;
}
