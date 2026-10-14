"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Camera,
  Copy,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Music2,
  Phone,
  ShieldAlert,
  Sparkles,
  Check,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyBusinesses } from "@/lib/core/business-api";
import type { IBusiness } from "@/types/business";
import SellerEmptyState from "./SellerEmptyState";
import SellerPageHeader from "./SellerPageHeader";
import SellerStatusBadge from "./SellerStatusBadge";

const formatLabel = (value: string) =>
  value.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

function trustScoreColor(score: number): string {
  if (score >= 70) return "#10b981";
  if (score >= 40) return "#f59e0b";
  return "#f43f5e";
}

/**
 * Digital Trust Passport.
 *
 * A preview of the public business profile (`/businesses/[slug]`) plus a
 * shareable link. It only reuses data the business API already returns — there
 * is no passport-specific endpoint, so nothing here is invented.
 */
export default function SellerTrustPassport() {
  const [businesses, setBusinesses] = useState<IBusiness[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getMyBusinesses();
        if (!result.ok || !result.data) {
          throw new Error(result.message);
        }
        if (!active) return;
        const ownedBusinesses = result.data;
        setBusinesses(ownedBusinesses);
        setSelectedId((current) =>
          ownedBusinesses.some((business) => business.id === current)
            ? current
            : (ownedBusinesses[0]?.id ?? ""),
        );
      } catch (loadError) {
        console.error("Could not load businesses for the passport:", loadError);
        if (active) {
          setError(
            loadError instanceof Error ? loadError.message : "Could not load your businesses.",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const business = useMemo(
    () => businesses.find((item) => item.id === selectedId) ?? null,
    [businesses, selectedId],
  );

  const publicPath = business ? `/businesses/${business.slug || business.id}` : "";
  // Share the path only — the host is supplied by whoever opens the link.
  const publicUrl = publicPath;

  const handleCopy = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const header = (
    <SellerPageHeader
      icon={Sparkles}
      title="Digital Trust Passport"
      badge={business ? business.name : "Passport"}
      description="Preview the public profile customers see and share its link."
    />
  );

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {header}
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]" role="status">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {header}
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {header}
        <SellerEmptyState
          icon={Building2}
          title="Create a business first"
          description="Your Trust Passport is built from your business profile. Set up a business to publish a public page."
          action={
            <Link
              href="/dashboard/seller/settings/buisnessform"
              className={buttonVariants({ className: "gap-2" })}
            >
              Create a business
            </Link>
          }
        />
      </div>
    );
  }

  const trustScore = business ? Math.min(100, Math.max(0, business.trustScore)) : 0;
  const scoreColor = trustScoreColor(trustScore);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {header}

      {businesses.length > 1 && (
        <label className="block max-w-md space-y-2 text-sm font-medium text-foreground">
          Passport for
          <select
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            className="h-10 w-full rounded-field border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            {businesses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {business && (
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Public preview */}
          <article className="overflow-hidden rounded-2xl border border-border bg-surface shadow-surface">
            <div className="relative h-40 bg-linear-to-br from-emerald-950 via-teal-900 to-slate-900 sm:h-52">
              {business.coverUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={business.coverUrl}
                  alt={`${business.name} cover`}
                  className="h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-5">
                {business.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={business.logoUrl}
                    alt={`${business.name} logo`}
                    className="size-16 rounded-2xl border-2 border-white/80 bg-white object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border-2 border-white/80 bg-primary text-xl font-bold text-primary-foreground shadow-lg">
                    {business.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 text-white">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
                    {formatLabel(business.businessType)}
                  </p>
                  <h2 className="mt-0.5 truncate text-xl font-bold sm:text-2xl">{business.name}</h2>
                  {business.address && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
                      <MapPin className="size-4 shrink-0" aria-hidden="true" />
                      {business.address.city}, {formatLabel(business.address.division)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex flex-wrap items-center gap-2.5">
                <SellerStatusBadge status={business.verificationStatus} />
                {business.isFeatured && <span className="text-xs font-semibold text-amber-600">Featured</span>}
              </div>

              <div className="flex flex-col items-center gap-5 border-y border-border py-6 sm:flex-row">
                <div
                  className="size-28 shrink-0 rounded-full p-2"
                  role="meter"
                  aria-label="Trust score"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={trustScore}
                  style={{
                    background: `conic-gradient(from -90deg, ${scoreColor} 0deg ${trustScore * 3.6}deg, var(--muted) ${trustScore * 3.6}deg 360deg)`,
                  }}
                >
                  <div className="flex size-full flex-col items-center justify-center rounded-full bg-surface">
                    <span className="text-3xl font-bold tabular-nums" style={{ color: scoreColor }}>
                      {trustScore}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">of 100</span>
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">TrustPass score</p>
                  <h3 className="mt-1 text-lg font-semibold text-foreground">Trust score</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {trustScore === 0
                      ? "No trust score has been recorded yet."
                      : "This is the score customers see on your public profile."}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-foreground">About this business</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                  {business.description || "No business description provided."}
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-foreground">Contact &amp; links</h3>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {business.contactPhone && (
                    <a
                      aria-label={`Call ${business.name}`}
                      href={`tel:${business.contactPhone}`}
                      className="flex size-11 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/10"
                    >
                      <Phone className="size-5" aria-hidden="true" />
                    </a>
                  )}
                  {business.contactEmail && (
                    <a
                      aria-label={`Email ${business.name}`}
                      href={`mailto:${business.contactEmail}`}
                      className="flex size-11 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:border-rose-500/50 hover:bg-rose-500/10"
                    >
                      <Mail className="size-5" aria-hidden="true" />
                    </a>
                  )}
                  {business.websiteUrl && (
                    <a
                      aria-label={`Visit ${business.name} website`}
                      href={business.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex size-11 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:border-sky-500/50 hover:bg-sky-500/10"
                    >
                      <Globe className="size-5" aria-hidden="true" />
                    </a>
                  )}
                  {business.instaUrl && (
                    <a
                      aria-label={`${business.name} on Instagram`}
                      href={business.instaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex size-11 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:border-fuchsia-500/50 hover:bg-fuchsia-500/10"
                    >
                      <Camera className="size-5" aria-hidden="true" />
                    </a>
                  )}
                  {business.tiktokUrl && (
                    <a
                      aria-label={`${business.name} on TikTok`}
                      href={business.tiktokUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex size-11 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:border-cyan-500/50 hover:bg-cyan-500/10"
                    >
                      <Music2 className="size-5" aria-hidden="true" />
                    </a>
                  )}
                  {!business.contactPhone &&
                    !business.contactEmail &&
                    !business.websiteUrl &&
                    !business.instaUrl &&
                    !business.tiktokUrl && (
                      <p className="text-sm text-muted-foreground">No contact information provided.</p>
                    )}
                </div>
              </div>
            </div>
          </article>

          {/* Share + status */}
          <aside className="space-y-6">
            <Card className="border-border/80 bg-surface shadow-surface">
              <CardHeader>
                <CardTitle className="text-base">Share this Passport</CardTitle>
                <CardDescription>Anyone with the link can view your public profile.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-muted-foreground">
                  <span className="break-all">{publicUrl || "—"}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" className="gap-2" onClick={() => void handleCopy()} disabled={!publicUrl}>
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                    {copied ? "Copied" : "Copy link"}
                  </Button>
                  <Link
                    href={publicPath || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonVariants({ className: "gap-2" })}
                  >
                    <ExternalLink className="size-4" />
                    Open public page
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-surface shadow-surface">
              <CardHeader>
                <CardTitle className="text-base">Verification</CardTitle>
                <CardDescription>Verify your business to strengthen your Passport.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <SellerStatusBadge status={business.verificationStatus} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Trust score</span>
                  <span className="font-medium tabular-nums text-foreground">{trustScore}/100</span>
                </div>
                {business.verificationStatus !== "VERIFIED" && (
                  <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <ShieldAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                    Complete verification to show a trusted badge publicly.
                  </p>
                )}
                <Link
                  href="/dashboard/seller/settings/verification"
                  className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5" })}
                >
                  Manage verification
                </Link>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}
    </div>
  );
}
