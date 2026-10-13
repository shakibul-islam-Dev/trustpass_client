import SellerBusinessVerification from "@/components/seller/SellerBusinessVerification";

/**
 * Seller verification page.
 *
 * Lets a seller review the verification status of their business, manage the
 * documents the backend expects (Trade License, NID, TIN), and submit the
 * business for review.
 *
 * Optional `?id=<businessId>` preselects one of the seller's businesses.
 */
export default async function SellerVerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>;
}) {
  const params = await searchParams;
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  return <SellerBusinessVerification initialBusinessId={id} />;
}
