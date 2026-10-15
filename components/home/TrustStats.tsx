import { Building2, ShieldCheck, Users, BarChart3 } from "lucide-react";

const stats = [
    {
        icon: Building2,
        value: "12,000+",
        label: "Verified Businesses",
        sublabel: "Active on the platform",
    },
    {
        icon: ShieldCheck,
        value: "98%",
        label: "Moderation Accuracy",
        sublabel: "Staff-reviewed listings",
    },
    {
        icon: Users,
        value: "85,000+",
        label: "Trusted Users",
        sublabel: "Buyers & sellers",
    },
    {
        icon: BarChart3,
        value: "4.9 / 5",
        label: "Average Trust Score",
        sublabel: "Across verified businesses",
    },
];

export default function TrustStats() {
    return (
        <section className="bg-background py-14 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-12">
                    <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={stat.label}
                                    className="flex flex-col items-center text-center"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                        <Icon className="h-6 w-6 text-primary" strokeWidth={1.6} />
                                    </div>
                                    <p className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                                        {stat.value}
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-foreground">
                                        {stat.label}
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {stat.sublabel}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
