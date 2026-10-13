/**
 * The seller dashboard's fixed set of sections.
 *
 * Kept in a standalone module so the individual panels can reference the type
 * without importing the dashboard shell (which would create a circular
 * dependency).
 */
export type SellerSectionId =
  | "overview"
  | "business"
  | "products"
  | "directory"
  | "verification";
