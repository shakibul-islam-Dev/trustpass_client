import Image from "next/image";
import { Search, ShieldCheck, Star } from "lucide-react";

const steps = [
    {
        icon: Search,
        step: "01",
        title: "Search & Discover",
        description:
            "Browse thousands of verified businesses by category, location, or keyword. Filter by Trust Score to find only the most trusted vendors.",
    },
    {
        icon: ShieldCheck,
        step: "02",
        title: "Verify Legitimacy",
        description:
            "Inspect verified legal documents — trade licenses, business registration, and staff-reviewed compliance records before you commit.",
    },
    {
        icon: Star,
        step: "03",
        title: "Transact with Confidence",
        description:
            "Connect with verified businesses backed by real reviews, transparent scoring, and active moderator oversight — no guesswork.",
    },
];

export default function HowItWorks() {
    return (
        <section className="bg-muted/40 py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-2xl text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        How It Works
                    </span>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Trust built into every step
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground">
                        From discovery to transaction — every step on TrustPass is designed
                        to give you verified confidence.
                    </p>
                </div>

                {/* Illustration */}
                <div className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-2xl border border-border shadow-sm">
                    <Image
                        src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&auto=format&fit=crop&q=80"
                        alt="Business professionals collaborating and verifying documents"
                        width={900}
                        height={400}
                        className="h-48 w-full object-cover sm:h-64"
                    />
                </div>

                {/* Steps */}
                <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
                    {steps.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.step} className="relative flex flex-col items-center text-center">
                                {/* Connector line between steps */}
                                {index < steps.length - 1 && (
                                    <div
                                        aria-hidden="true"
                                        className="absolute left-1/2 top-8 hidden h-px w-full translate-x-1/2 border-t border-dashed border-border sm:block"
                                    />
                                )}
                                {/* Icon bubble */}
                                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 shadow-sm">
                                    <Icon className="h-7 w-7 text-primary" strokeWidth={1.6} />
                                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                        {index + 1}
                                    </span>
                                </div>
                                <h3 className="mt-5 text-base font-semibold text-foreground">
                                    {item.title}
                                </h3>
                                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                                    {item.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
