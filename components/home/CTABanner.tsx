import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function CTABanner() {
    return (
        <section className="bg-background py-14 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative isolate overflow-hidden rounded-2xl bg-primary px-8 py-14 text-center shadow-glow sm:px-16">
                    {/* Decorative blobs */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-white/10 blur-3xl"
                    />

                    <div className="relative z-10">
                        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-primary-foreground">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            For Business Owners
                        </div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-primary-foreground sm:text-3xl lg:text-4xl">
                            Ready to build trust with your customers?
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-primary-foreground/80">
                            List your business on TrustPass, submit your documents, and earn a
                            verified badge that signals legitimacy to thousands of buyers
                            actively searching for businesses like yours.
                        </p>

                        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link
                                href="/auth/register"
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-md active:translate-y-0"
                            >
                                Register Your Business
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/businessesExplore"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-primary-foreground backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20 active:translate-y-0"
                            >
                                Explore the Directory
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
