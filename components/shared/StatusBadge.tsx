import { Badge } from "@/components/ui/badge";

/** Badge intents a status can resolve to. */
type StatusVariant =
  | "success"
  | "warning"
  | "danger"
  | "outline"
  | "secondary"
  | "primary-soft";

interface StatusStyle {
  variant: StatusVariant;
  label: string;
}

/**
 * One place to turn any status string the API returns into a consistent badge.
 *
 * Every dashboard (seller, admin, moderator, customer) reuses this so a status
 * looks identical everywhere, and the meaning always maps to the same semantic
 * colour. Unknown values fall through to a neutral badge showing the raw text.
 */
const STATUS_STYLES: Record<string, StatusStyle> = {
  // Good
  verified: { variant: "success", label: "Verified" },
  approved: { variant: "success", label: "Approved" },
  active: { variant: "success", label: "Active" },
  published: { variant: "success", label: "Published" },
  paid: { variant: "success", label: "Paid" },
  resolved: { variant: "success", label: "Resolved" },
  completed: { variant: "success", label: "Completed" },
  // In progress
  pending: { variant: "warning", label: "Pending" },
  "under review": { variant: "warning", label: "Under review" },
  processing: { variant: "warning", label: "Processing" },
  "out of stock": { variant: "warning", label: "Out of stock" },
  open: { variant: "warning", label: "Open" },
  // Neutral
  draft: { variant: "outline", label: "Draft" },
  inactive: { variant: "outline", label: "Inactive" },
  unverified: { variant: "outline", label: "Not submitted" },
  closed: { variant: "outline", label: "Closed" },
  // Needs attention
  rejected: { variant: "danger", label: "Rejected" },
  failed: { variant: "danger", label: "Failed" },
  suspended: { variant: "danger", label: "Suspended" },
  missing: { variant: "danger", label: "Missing" },
  blocked: { variant: "danger", label: "Blocked" },
};

/** Turn any status string into the friendly label the badge would show. */
export const statusLabel = (status: string): string =>
  STATUS_STYLES[status.trim().toLowerCase()]?.label ?? status;

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const style: StatusStyle = STATUS_STYLES[status.trim().toLowerCase()] ?? {
    variant: "secondary",
    label: status,
  };

  return (
    <Badge variant={style.variant} className={className}>
      {style.label}
    </Badge>
  );
}
