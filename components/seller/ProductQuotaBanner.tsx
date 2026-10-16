"use client";

import Link from "next/link";
import { Crown } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useSellerTier } from "@/hooks/use-seller-tier";
import { FREE_PRODUCT_LIMIT } from "@/lib/core/plan";

/**
 * "X of 5 free products used" strip shown above the catalog.
 *
 * FREE plan only — Pro sellers have no listing limit, so the strip is hidden
 * for them entirely (the "Pro — unlimited" variant was removed by request).
 * It also stays hidden while the tier is still resolving so a Pro seller never
 * sees a free-plan flash on first paint.
 *
 * Informational only — the server is the source of truth and already rejects
 * a 6th free product with a 402. This just warns earlier and offers the
 * upgrade path so the seller is not surprised at save time.
 */
export default function ProductQuotaBanner({
  productCount,
}: {
  productCount: number;
}) {
  const { tier, isLoading } = useSellerTier();

  // Hide for Pro sellers — and while the tier is still being resolved.
  if (isLoading || tier === "PRO") {
    return null;
  }

  const remaining = Math.max(0, FREE_PRODUCT_LIMIT - productCount);
  const atLimit = remaining === 0;
  const percent = Math.min(100, Math.round((productCount / FREE_PRODUCT_LIMIT) * 100));

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-4 text-sm sm:flex-row sm:items-center sm:justify-between ${
        atLimit ? "border-warning/40 bg-warning/5" : "border-border bg-surface"
      }`}
    >
      <div className="min-w-0 space-y-2">
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">{productCount}</span> of{" "}
          {FREE_PRODUCT_LIMIT} free product listings used.{" "}
          {atLimit
            ? "You have reached the free limit — upgrade to add more."
            : `${remaining} remaining on the free plan.`}
        </p>
        <div
          className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-surface-secondary"
          role="progressbar"
          aria-label="Free product listing usage"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div
            className={`h-full rounded-full ${atLimit ? "bg-warning" : "bg-primary"}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <Link
        href="/pricing"
        className={buttonVariants({ size: "sm", className: "gap-1.5 sm:shrink-0" })}
      >
        <Crown className="size-4" />
        Upgrade to Pro
      </Link>
    </div>
  );
}
