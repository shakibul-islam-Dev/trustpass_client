"use client";

import Link from "next/link";
import { Check, Crown, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useSellerTier } from "@/hooks/use-seller-tier";
import { FREE_PRODUCT_LIMIT, PRO_LISTING_FEE_BDT } from "@/lib/core/plan";
import { cn } from "@/lib/utils";

const freeFeatures = [
  `Up to ${FREE_PRODUCT_LIMIT} product listings`,
  "Verified business profile",
  "Public business page & Trust Passport",
  "Basic trust score",
  "Community support",
];

const proFeatures = [
  "Unlimited product listings",
  `Only ৳${PRO_LISTING_FEE_BDT} per extra listing slot`,
  "Priority placement in search",
  "Featured badge eligibility",
  "Everything in Free",
];

export default function PricingPlans() {
  const { isAuthenticated, role } = useAuth();
  const isSeller = isAuthenticated && role === "SELLER";
  const { tier } = useSellerTier(isSeller);
  const isPro = isSeller && tier === "PRO";

  // Free plan CTA: sellers go to their dashboard, everyone else registers.
  const freeHref = isSeller ? "/dashboard/seller" : "/auth/register";
  // Upgrade CTA: signed-in sellers pay from the payments page (bKash).
  const proHref = isSeller ? "/dashboard/seller/payments" : "/auth/register";
  const freeLabel = isSeller ? "Go to dashboard" : "Start for free";
  const proLabel = isSeller ? "Buy listing slots" : "Get started";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <header className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          Plans
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Start free, upgrade when you grow
        </h1>
        <p className="mt-3 text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
          Every seller starts on the Free plan with {FREE_PRODUCT_LIMIT} product
          listings. Need more reach? Upgrade to Pro and list as much as you want.
        </p>
        {isSeller && (
          <p className="mt-4 text-sm font-medium text-foreground">
            You are currently on the{" "}
            <span className={cn("font-semibold", isPro ? "text-primary" : "text-muted-foreground")}>
              {isPro ? "Pro" : "Free"}
            </span>{" "}
            plan.
          </p>
        )}
      </header>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:gap-8">
        {/* Free plan */}
        <section className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-surface sm:p-8">
          <div className="flex items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-xl bg-surface-secondary text-muted-foreground">
              <Sparkles className="size-5" />
            </span>
            <h2 className="text-lg font-semibold text-foreground">Free</h2>
          </div>
          <p className="mt-4">
            <span className="text-4xl font-bold tracking-tight text-foreground">৳0</span>
            <span className="ml-1 text-sm text-muted-foreground">/ forever</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Everything you need to put your business on the map.
          </p>

          <ul className="mt-6 flex-1 space-y-3 text-sm">
            {freeFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                {feature}
              </li>
            ))}
          </ul>

          <Link
            href={freeHref}
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "mt-8 h-11 w-full",
            })}
          >
            {freeLabel}
          </Link>
        </section>

        {/* Pro plan */}
        <section className="relative flex flex-col rounded-2xl border-2 border-primary bg-surface p-6 shadow-overlay sm:p-8">
          <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            Most popular
          </span>
          <div className="flex items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Crown className="size-5" />
            </span>
            <h2 className="text-lg font-semibold text-foreground">Pro</h2>
          </div>
          <p className="mt-4">
            <span className="text-4xl font-bold tracking-tight text-foreground">
              ৳{PRO_LISTING_FEE_BDT}
            </span>
            <span className="ml-1 text-sm text-muted-foreground">/ extra listing slot</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Pay only for what you list beyond the free plan.
          </p>

          <ul className="mt-6 flex-1 space-y-3 text-sm">
            {proFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                {feature}
              </li>
            ))}
          </ul>

          <Link
            href={proHref}
            className={buttonVariants({
              size: "lg",
              className: "mt-8 h-11 w-full gap-1.5",
            })}
          >
            <Crown className="size-4" />
            {isPro ? "Buy more slots" : proLabel}
          </Link>
        </section>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Payments are processed securely via bKash. Prices are in BDT.
      </p>
    </div>
  );
}
