"use client";

import * as React from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { cn } from "cn";

/**
 * Shared branded frame for every public auth screen.
 *
 * One component so login / registration / OTP / reset all feel like the
 * same product instead of five utility cards on gray:
 *
 *   • ambient brand-glow background (no noise, no clutter)
 *   • a floating rounded card that becomes a TWO-PANEL layout on lg+:
 *       left  = gradient brand panel (logo, headline, trust bullets)
 *       right = the form
 *   • on small screens the brand panel collapses into a compact header
 *     above the form so mobile stays single-column and focused
 *
 * Everything visual lives here; screens only pass title/subtitle/children.
 */

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Max width of the whole frame. Registration is taller → pass "lg". */
  size?: "md" | "lg";
  className?: string;
}

const trustPoints = [
  {
    text: "Verified businesses with trusted reputation scores",
  },
  {
    text: "Secure document uploads — Trade License, NID & TIN",
  },
  {
    text: "Transparent trust scores you can act on",
  },
];

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
  size = "md",
  className,
}: AuthShellProps) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background px-4 py-8 sm:px-6 sm:py-12">
      {/* Ambient brand glow — soft, no clutter */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 select-none"
      >
        <div className="absolute -top-40 left-1/2 h-[28rem] w-[44rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute -bottom-48 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div
        className={cn(
          "relative mx-auto flex w-full flex-col",
          size === "lg" ? "max-w-5xl" : "max-w-md",
          className,
        )}
      >
        {/* ============ Card frame (single card on mobile, two-panel on lg+) ============ */}
        <div
          data-slot="auth-frame"
          className="group/frame animate-in fade-in-0 slide-in-from-bottom-3 overflow-hidden rounded-3xl border border-border bg-card shadow-overlay duration-500 ease-out lg:grid lg:grid-cols-[1fr_1.05fr]"
        >
          {/* ---------- Brand panel (desktop) ---------- */}
          <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-deep p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
            {/* soft glow inside the panel */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-white/15 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-black/20 blur-3xl"
            />

            {/* Logo */}
            <div className="relative flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
                <ShieldCheck className="size-6" strokeWidth={2.2} />
              </div>
              <span className="text-xl font-bold tracking-tight">
                TrustPass
              </span>
            </div>

            {/* Headline */}
            <div className="relative my-8 space-y-4 lg:my-0">
              <h2 className="text-balance text-3xl leading-[1.15] font-extrabold tracking-tight xl:text-4xl">
                Trust is the product.
                <span className="mt-2 block text-white/70">
                  We&apos;re just the proof.
                </span>
              </h2>

              {/* Trust bullets */}
              <ul className="space-y-3 pt-2 text-sm text-white/85">
                {trustPoints.map((point) => (
                  <li key={point.text} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-white/90" />
                    <span className="text-balance">{point.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subtle bottom note */}
            <p className="relative hidden text-xs text-white/50 sm:block">
              Safe · Verified · Transparent
            </p>
          </aside>

          {/* ---------- Form panel ---------- */}
          <div className="px-6 py-8 sm:px-10 sm:py-10">
            {/* Compact brand header (mobile/tablet only) */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow">
                <ShieldCheck className="size-5" strokeWidth={2.2} />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                TrustPass
              </span>
            </div>

            {/* Screen heading */}
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h1>
              {subtitle && (
                <p className="text-balance text-sm leading-relaxed text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="mt-8 space-y-4">{children}</div>

            {footer && (
              <div className="mt-8 border-t border-border pt-6">{footer}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}