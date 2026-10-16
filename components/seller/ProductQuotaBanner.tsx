"use client";

import Link from "next/link";
import { Crown, Infinity as InfinityIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useSellerTier } from "@/hooks/use-seller-tier";
import { FREE_PRODUCT_LIMIT } from "@/lib/core/plan";

/**
 * "X of 5 free products used" strip shown above the catalog.
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
  const { tier } = useSellerTier();
  const isPro = tier === "PRO";

  if (isPro) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-muted-foreground">
          <Crown className="size-4 text-primary" />
          <span>
            <span className="font-semibold text-foreground">Pro plan</span> — unlimited
            product listings.
          </span>
        </p>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <InfinityIcon className="size-3.5" />
          No listing limit
        </span>
      </div>
    );
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
