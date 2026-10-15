// Re-exported for backwards compatibility. The canonical implementation now
// lives in `components/shared/StatusBadge.tsx` so every dashboard (not only the
// seller one) shares the same status → badge mapping. Existing imports from
// "./SellerStatusBadge" keep working unchanged.
export { default, statusLabel } from "@/components/shared/StatusBadge";
