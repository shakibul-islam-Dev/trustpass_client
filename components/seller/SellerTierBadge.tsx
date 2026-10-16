"use client";

import Link from "next/link";
import { Crown, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { useSellerTier } from "@/hooks/use-seller-tier";

/**
 * Plan pill for the seller dashboard header.
 *
 * FREE  -> neutral pill + "Upgrade" button that opens the pricing page.
 * PRO   -> highlighted pill, no upgrade prompt.
 */
export default function SellerTierBadge() {
  const { tier, isLoading } = useSellerTier();
  const isPro = tier === "PRO";

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={isPro ? "primary-soft" : "outline"}
        className="gap-1 whitespace-nowrap"
        title={isPro ? "Paid plan" : "Free plan"}
      >
        {isPro ? <Crown className="size-3" /> : <Sparkles className="size-3" />}
        {isLoading ? "…" : isPro ? "Pro" : "Free"}
      </Badge>

      {!isLoading && !isPro && (
        <Link
          href="/pricing"
          className={buttonVariants({ size: "sm", className: "gap-1.5 whitespace-nowrap" })}
        >
          <Crown className="size-3.5" />
          Upgrade
        </Link>
      )}
    </div>
  );
}
