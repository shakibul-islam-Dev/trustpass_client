import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface SellerEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Optional call to action, e.g. a button or link. */
  action?: ReactNode;
}

/**
 * Friendly "nothing here yet" panel. Used whenever a seller route has no data
 * or the API has nothing to show.
 */
export default function SellerEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: SellerEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-7" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-foreground">{title}</h2>
      {description && (
        <p className="mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
