import Image from "next/image";
import { BadgeCheck, FileSearch, MessageSquareWarning, TrendingUp } from "lucide-react";

const features = [
    {
        icon: BadgeCheck,
        title: "Verified Business Badges",
        description:
            "Every listing is reviewed by our moderation team. Badges are awarded only after trade licenses and business documents pass verification.",
    },
    {
        icon: FileSearch,
        title: "Transparent Documentation",
        description:
            "View legal documents directly on a business's profile — trade license, NID/TIN, and compliance records are all visible.",
    },
    {
        icon: TrendingUp,
        title: "Dynamic Trust Scoring",
        description:
            "Trust Scores are calculated from verified reviews, documentation completeness, and moderation history — not just star ratings.",
    },
    {
        icon: MessageSquareWarning,
        title: "Report & Protect",
        description:
            "Spot something suspicious? File a report directly. Our moderators investigate every complaint and act on valid ones.",
    },
];

export default function WhyTrustPass() {
    return (
        <section className="bg-muted/40 py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                    {/* Left: Copy */}
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                            Why TrustPass
                        </span>
                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            We built trust into the platform — not as an afterthought
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                            Most directories just list businesses. TrustPass verifies them.
                            Our moderation layer, document checks, and scoring system exist so
                            you never have to wonder if a business is legitimate.
                        </p>

                        <ul className="mt-8 space-y-5">
                            {features.map((feature) => {
                                const Icon = feature.icon;
                                return (
                                    <li key={feature.title} className="flex gap-4">
                                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                                            <Icon className="h-4.5 w-4.5 text-primary" strokeWidth={1.7} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                {feature.title}
                                            </p>
                                            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Right: Visual */}
                    <div className="flex flex-col items-center gap-6">
                        {/* Photo */}
                        <div className="w-full overflow-hidden rounded-2xl border border-border shadow-md">
                            <Image
                                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&auto=format&fit=crop&q=80"
                                alt="Verified business owner with documents"
                                width={800}
                                height={360}
                                className="h-44 w-full object-cover sm:h-56"
                            />
                        </div>

                        {/* Card stack */}
                        <div className="relative flex w-full items-center justify-center">
                            {/* Background card */}
                            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl border border-border bg-card" />
                            {/* Foreground card */}
                            <div className="relative rounded-2xl border border-border bg-card p-6 shadow-md">
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-foreground">
                                        Business Trust Profile
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
                                        <BadgeCheck className="h-3.5 w-3.5" />
                                        Verified
                                    </span>
                                </div>

                                {/* Trust score ring mockup */}
                                <div className="my-5 flex flex-col items-center">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary bg-primary/10">
                                        <span className="text-2xl font-extrabold text-primary">92</span>
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground">Trust Score</p>
                                </div>

                                {/* Criteria rows */}
                                {[
                                    { label: "Trade License", done: true },
                                    { label: "NID / TIN Verified", done: true },
                                    { label: "Review Authenticity", done: true },
                                    { label: "Complaint History", done: true },
                                ].map((row) => (
                                    <div
                                        key={row.label}
                                        className="flex items-center justify-between border-t border-border py-2 text-xs"
                                    >
                                        <span className="text-muted-foreground">{row.label}</span>
                                        <BadgeCheck className="h-4 w-4 text-success" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
