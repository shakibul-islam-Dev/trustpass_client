"use client";

import Link from "next/link";
import {
  Bell,
  Building2,
  ExternalLink,
  Package,
  Sparkles,
} from "lucide-react";

import StatCards, { type StatItem } from "../dashboard/StatCard";
import AnalyticsChart from "../dashboard/AnalyticsChart";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { useSellerDashboardData } from "@/hooks/use-seller-dashboard";
import type { IBusiness } from "@/types/business";
import SellerStatusBadge from "./SellerStatusBadge";

/**
 * Share of the public business profile that is filled in.
 *
 * Derived only from fields the business API already returns — it does not
 * invent any business statistic. Nine real fields make up the percentage.
 */
function businessCompletionPercent(business: IBusiness): number {
  const fields = [
    business.name?.trim().length >= 2,
    Boolean(business.description?.trim()),
    Boolean(business.logoUrl),
    Boolean(business.coverUrl),
    Boolean(business.categoryId),
    Boolean(business.contactEmail?.trim()),
    Boolean(business.contactPhone?.trim()),
    Boolean(business.address?.addressLine?.trim()) && Boolean(business.address?.city?.trim()),
    Boolean(business.websiteUrl || business.instaUrl || business.tiktokUrl),
  ];
  const done = fields.filter(Boolean).length;
  return Math.round((done / fields.length) * 100);
}

/** Colour the trust score bar the same way the public profile does. */
function trustScoreColor(score: number): string {
  if (score >= 70) return "#10b981";
  if (score >= 40) return "#f59e0b";
  return "#f43f5e";
}

export default function SellerDashboard() {
  const { businesses, stats, productStatusSegments, publishedPercentage, isLoading, error } =
    useSellerDashboardData();

  const statItems: StatItem[] = [
    {
      id: "businesses",
      value: isLoading ? "…" : String(stats.businessCount),
      label: "Businesses",
      icon: Building2,
      iconColor: "text-primary",
      bgColor: "bg-primary-soft",
      caption: isLoading
        ? undefined
        : `${stats.averageTrustScore ?? 0}/100 avg trust`,
    },
    {
      id: "products",
      value: isLoading ? "…" : String(stats.productCount),
      label: "Total Products",
      icon: Package,
      iconColor: "text-primary",
      bgColor: "bg-primary-soft",
      caption: isLoading
        ? undefined
        : `${stats.publishedCount} published · ${stats.draftCount} draft`,
    },
    {
      id: "notifications",
      value: isLoading ? "…" : String(stats.unreadNotifications),
      label: "Unread Notifications",
      icon: Bell,
      iconColor: "text-muted-foreground",
      bgColor: "bg-surface-secondary",
      caption: "Across your account",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger"
        >
          {error}
        </div>
      )}

      {/* 0. Trust Passport — pinned to the top of the overview */}
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-surface">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Sparkles className="size-6" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-foreground">Trust Passport</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Preview the public profile customers see and copy its shareable link.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/seller/passport"
            className={buttonVariants({ className: "gap-1.5 sm:shrink-0" })}
          >
            <ExternalLink className="size-4" />
            Open Passport
          </Link>
        </div>
      </section>

      {/* 1. Top Section: stat cards (real data only) */}
      <StatCards items={statItems} />

      {/* 1b. Business health — verification, trust score, completion (real data) */}
      <section>
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-surface">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Verification &amp; trust</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Live status, trust score, and profile completion for your businesses.
              </p>
            </div>
            <Badge variant="outline">
              {stats.businessCount} business{stats.businessCount === 1 ? "" : "es"}
            </Badge>
          </div>

          {isLoading ? (
            <p role="status" className="mt-5 text-sm text-muted-foreground">
              Loading your businesses…
            </p>
          ) : businesses.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-border px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                You have not created a business yet. Create one to start building trust.
              </p>
              <Link
                href="/dashboard/seller/settings/buisnessform"
                className={buttonVariants({ size: "sm", className: "mt-3" })}
              >
                Create a business
              </Link>
            </div>
          ) : (
            <ul className="mt-5 space-y-4">
              {businesses.map((business) => {
                const completion = businessCompletionPercent(business);
                const score = Math.min(100, Math.max(0, business.trustScore));
                return (
                  <li key={business.id} className="rounded-xl border border-border bg-background/40 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary">
                        {business.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={business.logoUrl}
                            alt={business.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Building2 className="size-5" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">{business.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{business.slug}</p>
                      </div>
                      <SellerStatusBadge status={business.verificationStatus} />
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Trust score</span>
                          <span className="font-medium tabular-nums text-foreground">{score}/100</span>
                        </div>
                        <div
                          className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-secondary"
                          role="meter"
                          aria-label={`${business.name} trust score`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={score}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${score}%`, backgroundColor: trustScoreColor(score) }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Profile completion</span>
                          <span className="font-medium tabular-nums text-foreground">{completion}%</span>
                        </div>
                        <div
                          className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-secondary"
                          role="progressbar"
                          aria-label={`${business.name} profile completion`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={completion}
                        >
                          <div className="h-full rounded-full bg-primary" style={{ width: `${completion}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/businesses/${business.slug || business.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5" })}
                      >
                        <ExternalLink className="size-4" />
                        Public profile
                      </Link>
                      <Link
                        href="/dashboard/seller/passport"
                        className={buttonVariants({ variant: "ghost", size: "sm", className: "gap-1.5" })}
                      >
                        <Sparkles className="size-4" />
                        Trust Passport
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* 2. Catalog status — real product-status breakdown (full width) */}
      <section>
        <AnalyticsChart
          title="Catalog status"
          segments={productStatusSegments}
          centerValue={isLoading ? undefined : `${publishedPercentage}%`}
          centerLabel="Published"
          pendingMessage="Add products to your catalog and the breakdown will show up here."
        />
      </section>
    </div>
  );
}
