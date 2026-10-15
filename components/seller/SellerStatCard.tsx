import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

/** The five intents a stat card can use. Kept small on purpose. */
type StatTone = "primary" | "success" | "warning" | "danger" | "neutral";

const toneClasses: Record<StatTone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-surface-secondary text-muted-foreground",
};

interface SellerStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Small supporting line under the value. */
  hint?: string;
  tone?: StatTone;
  /** When set the whole card becomes a link. */
  href?: string;
  /** When set the whole card becomes a clickable button. */
  onClick?: () => void;
}

/**
 * A single metric tile. Reused by analytics, products, orders and settings so
 * every seller page shows numbers the same way.
 */
export default function SellerStatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "primary",
  href,
  onClick,
}: SellerStatCardProps) {
  const card = (
    <Card className="h-full border-border/80 bg-surface shadow-surface transition-colors hover:border-primary/30 [--card-spacing:--spacing(5)]">
      <CardContent>
        <div className="flex items-center justify-between gap-3">
          <span className={`flex size-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
            <Icon className="size-5" />
          </span>
          {(href || onClick) && <ArrowUpRight className="size-4 text-muted-foreground" />}
        </div>

        <p className="mt-4 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
        <p className="mt-0.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        {hint && <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-2xl focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
      >
        {card}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="block w-full rounded-2xl text-left focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
      >
        {card}
      </button>
    );
  }

  return card;
}
