import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  FileWarning,
  Search,
  ShieldCheck,
} from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Find a business',
    description:
      'Search the directory by business name or browse by industry to find the company you are considering.',
  },
  {
    icon: BadgeCheck,
    title: 'Review its profile',
    description:
      'Check the business verification status, profile details, and Trust Score together before making a decision.',
  },
  {
    icon: FileWarning,
    title: 'Report a concern',
    description:
      'If something seems wrong, open the business profile and send a report for moderator review.',
  },
];

export default function HomeTrustGuide() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-background px-4 py-20 text-foreground sm:px-6 sm:py-24 lg:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-72 max-w-5xl rounded-full bg-primary/5 blur-3xl"
        />
        <div className="mx-auto max-w-7xl">
          <div className="animate-rise mx-auto max-w-2xl text-center motion-reduce:animate-none">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              A clearer way to choose
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Make a more informed
              <span className="text-primary"> business decision</span>
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
              TrustPass brings business profiles, verification status, and Trust
              Scores together so you can review the information available before
              you connect.
            </p>
          </div>

          <div className="relative mt-12 grid gap-5 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, description }, index) => (
              <article
                key={title}
                className="group animate-rise relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-6 shadow-sm transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 motion-reduce:animate-none motion-reduce:transform-none motion-reduce:transition-none"
                style={{ animationDelay: `${120 + index * 120}ms` }}
              >
                <div
                  aria-hidden="true"
                  className="absolute -right-10 -top-10 size-32 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-125 motion-reduce:transition-none"
                />
                <div className="relative flex items-start justify-between">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10 transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <span className="font-mono text-xs font-semibold tracking-widest text-muted-foreground/70">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="relative mt-6 text-lg font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="relative mt-2 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
                {index < steps.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="absolute -right-3 top-12 z-10 hidden size-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground md:flex"
                  >
                    <ArrowRight className="size-3" />
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 px-4 py-16 text-foreground sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm lg:grid-cols-[1fr_0.9fr] lg:items-stretch">
          <div className="p-6 sm:p-10 lg:py-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-success-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-success">
              <BadgeCheck className="size-3.5" aria-hidden="true" />
              Your quick review
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              What should you check?
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              Use the information on a business profile as a starting point. A
              Trust Score is one signal—not a guarantee—so review the details
              that matter to you.
            </p>

            <Link
              href="/businesses"
              className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
            >
              Explore the directory
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="relative overflow-hidden border-t border-border bg-gradient-to-br from-primary/5 via-background to-success/10 p-6 sm:p-10 lg:border-l lg:border-t-0">
            <div
              aria-hidden="true"
              className="absolute -right-16 -top-20 size-56 rounded-full border border-primary/10"
            />
            <div
              aria-hidden="true"
              className="absolute -right-8 -top-12 size-40 rounded-full border border-primary/10"
            />
            <div className="relative mx-auto max-w-md space-y-3">
              <div className="animate-rise flex items-center gap-3 rounded-xl border border-border/80 bg-card/90 p-4 shadow-sm backdrop-blur-sm motion-reduce:animate-none">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success">
                  <BadgeCheck className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">Verification status</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">Check the business profile</span>
                </span>
                <span className="rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
                  Review
                </span>
              </div>
              <div className="animate-rise flex items-center gap-3 rounded-xl border border-border/80 bg-card/90 p-4 shadow-sm backdrop-blur-sm motion-reduce:animate-none [animation-delay:120ms]">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">Trust Score</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">One signal among several</span>
                </span>
                <span className="text-xs font-medium text-muted-foreground">/ 100</span>
              </div>
              <div className="animate-rise flex items-center gap-3 rounded-xl border border-border/80 bg-card/90 p-4 shadow-sm backdrop-blur-sm motion-reduce:animate-none [animation-delay:240ms]">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-warning-soft text-warning">
                  <Search className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">Business details</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">Description and contact info</span>
                </span>
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background px-4 py-16 text-foreground sm:px-6 sm:py-20 lg:px-8">
        <div className="group relative mx-auto flex max-w-7xl flex-col gap-6 overflow-hidden rounded-3xl bg-primary px-6 py-10 text-primary-foreground shadow-xl shadow-primary/15 sm:px-10 sm:py-12 md:flex-row md:items-center md:justify-between">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-28 size-80 rounded-full border border-primary-foreground/10 transition-transform duration-700 group-hover:scale-110 motion-reduce:transition-none"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-16 size-56 rounded-full border border-primary-foreground/10"
          />
          <div className="relative max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-foreground/75">
              <FileWarning className="size-4" aria-hidden="true" />
              Help keep the directory trustworthy
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Have a concern about a business?
            </h2>
            <p className="mt-3 text-sm leading-6 text-primary-foreground/85">
              Find the business in the directory and use the report option on
              its profile. Reports are reviewed by TrustPass moderators.
            </p>
          </div>
          <div className="relative">
            <Link
              href="/businesses"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-background/90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-primary motion-reduce:transform-none motion-reduce:transition-none"
            >
              Find a business to report
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
