import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";

/**
 * Reusable page header for the seller dashboard.
 *
 * One component gives every seller route the same look: an icon tile, a title,
 * an optional badge + description, and a slot for page actions.
 */
interface SellerPageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: string;
  /** Optional back link shown above the title. */
  backHref?: string;
  backLabel?: string;
  /** Buttons or links shown on the right (wraps on small screens). */
  actions?: ReactNode;
}

export default function SellerPageHeader({
  title,
  description,
  icon: Icon,
  badge,
  backHref,
  backLabel = "Back",
  actions,
}: SellerPageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 rounded-2xl border border-border/70 bg-surface p-6 shadow-surface sm:p-7">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          {backLabel}
        </Link>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {Icon && (
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="size-6" />
            </span>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h1>
              {badge && <Badge variant="primary-soft">{badge}</Badge>}
            </div>
            {description && (
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
