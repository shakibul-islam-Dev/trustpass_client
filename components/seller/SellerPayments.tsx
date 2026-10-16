"use client";

import { useState, useEffect } from "react";
import {
    CheckCircle2,
    CreditCard,
    History,
    Loader2,
    ShieldCheck,
    Wallet,
    XCircle,
    Clock3,
    ArrowRight,
    BadgeCheck,
    RefreshCw,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import SellerPageHeader from "@/components/seller/SellerPageHeader";
import SellerEmptyState from "@/components/seller/SellerEmptyState";
import {
    initiateBkashPayment,
    getMyPayments,
    getListingQuota,
    type PaymentRecord,
    type ListingQuota,
} from "@/lib/core/bkash-api";
import { getMyBusinesses } from "@/lib/core/business-api";
import { useSellerTier } from "@/hooks/use-seller-tier";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = "checkout" | "history";
type PaymentMethodId = "bkash";

const PAYMENT_METHODS: {
    id: PaymentMethodId;
    title: string;
    description: string;
    icon: typeof Wallet;
}[] = [
        {
            id: "bkash",
            title: "bKash",
            description: "Pay securely via bKash mobile banking",
            icon: Wallet,
        },
    ];

// ---------------------------------------------------------------------------
// Helper: map API status → display
// ---------------------------------------------------------------------------

function mapStatus(status: PaymentRecord["status"]): "Paid" | "Pending" | "Failed" | "Cancelled" | "Refunded" {
    switch (status) {
        case "SUCCESS":
            return "Paid";
        case "PENDING":
            return "Pending";
        case "CANCELLED":
            return "Cancelled";
        case "REFUNDED":
            return "Refunded";
        case "FAILED":
            return "Failed";
    }
}

function formatDate(iso?: string) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

// ---------------------------------------------------------------------------
// PaymentMethodCard
// ---------------------------------------------------------------------------

function PaymentMethodCard({
    method,
    selected,
    onSelect,
}: {
    method: (typeof PAYMENT_METHODS)[number];
    selected: boolean;
    onSelect: () => void;
}) {
    const Icon = method.icon;
    return (
        <button
            type="button"
            aria-pressed={selected}
            onClick={onSelect}
            className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${selected
                ? "border-primary bg-primary/5 ring-2 ring-primary/15"
                : "border-border bg-background/40 hover:bg-surface-secondary"
                }`}
        >
            <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-secondary text-muted-foreground"
                    }`}
            >
                <Icon className="size-5" />
            </span>
            <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-foreground">
                    {method.title}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                    {method.description}
                </span>
            </span>
            <span
                className={`size-4 shrink-0 rounded-full border-2 transition-colors ${selected ? "border-[6px] border-primary" : "border-border"
                    }`}
                aria-hidden="true"
            />
        </button>
    );
}

// ---------------------------------------------------------------------------
// QuotaBanner — shows listing slot quota from API
// ---------------------------------------------------------------------------

function QuotaBanner({ quota }: { quota: ListingQuota }) {
    const usedFree = quota.freeLimit - quota.freeSlotsRemaining;
    const freePct = quota.freeLimit > 0 ? Math.round((usedFree / quota.freeLimit) * 100) : 100;

    return (
        <div className="rounded-xl border border-border bg-background/50 p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-foreground">Listing quota</span>
                {quota.requiresPayment ? (
                    <Badge variant="warning" className="gap-1.5">
                        <Clock3 className="size-3" />
                        Payment required
                    </Badge>
                ) : (
                    <Badge variant="success" className="gap-1.5">
                        <CheckCircle2 className="size-3" />
                        Free tier active
                    </Badge>
                )}
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Free slots used</span>
                    <span className="tabular-nums">{usedFree} / {quota.freeLimit}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                    <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${freePct}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-border rounded-lg border border-border overflow-hidden text-center text-xs">
                <div className="px-3 py-2 bg-background/40">
                    <p className="font-semibold text-foreground tabular-nums">{quota.currentProductCount}</p>
                    <p className="text-muted-foreground mt-0.5">Listed</p>
                </div>
                <div className="px-3 py-2 bg-background/40">
                    <p className="font-semibold text-foreground tabular-nums">{quota.freeSlotsRemaining}</p>
                    <p className="text-muted-foreground mt-0.5">Free left</p>
                </div>
                <div className="px-3 py-2 bg-background/40">
                    <p className="font-semibold text-foreground tabular-nums">{quota.paidSlotsAvailable}</p>
                    <p className="text-muted-foreground mt-0.5">Paid slots</p>
                </div>
            </div>

            {quota.requiresPayment && (
                <p className="text-xs text-muted-foreground">
                    Free limit reached. Each additional slot costs{" "}
                    <span className="font-medium text-foreground">
                        {quota.currency} {quota.listingFeePerProduct}
                    </span>.
                </p>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// OrderSummary
// ---------------------------------------------------------------------------

function OrderSummary({
    amount,
    purpose,
    error,
    isPaying,
    disabled,
    onPay,
}: {
    amount: string;
    purpose: string;
    error: string | null;
    isPaying: boolean;
    disabled?: boolean;
    onPay: () => void;
}) {
    return (
        <Card className="h-fit border-border/80 bg-surface shadow-surface">
            <CardHeader>
                <CardTitle>Order summary</CardTitle>
                <CardDescription>Review your payment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-xl border border-border bg-background/50 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">{purpose}</span>
                        <span className="font-semibold text-foreground tabular-nums">
                            {amount}
                        </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">Processing fee</span>
                        <span className="font-medium text-foreground">৳0.00</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-foreground">Total due</span>
                        <span className="text-lg font-bold tabular-nums text-foreground">
                            {amount}
                        </span>
                    </div>
                </div>

                {error && (
                    <p
                        role="alert"
                        className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                    >
                        {error}
                    </p>
                )}

                <Button
                    className="w-full gap-2"
                    disabled={isPaying || disabled}
                    onClick={onPay}
                >
                    {isPaying ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            Redirecting to bKash…
                        </>
                    ) : (
                        <>
                            Pay {amount}
                            <ArrowRight className="size-4" />
                        </>
                    )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="size-4 text-success" />
                    Secured by bKash payment gateway
                </div>
            </CardContent>
        </Card>
    );
}

// ---------------------------------------------------------------------------
// PaymentHistoryTable
// ---------------------------------------------------------------------------

function PaymentHistoryTable({
    records,
    loading,
    onRefresh,
}: {
    records: PaymentRecord[];
    loading: boolean;
    onRefresh: () => void;
}) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="size-5 animate-spin mr-2" />
                <span className="text-sm">Loading payment history…</span>
            </div>
        );
    }

    if (records.length === 0) {
        return (
            <SellerEmptyState
                icon={History}
                title="No payment history yet"
                description="Your completed payments will appear here once you make your first payment."
            />
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-end">
                <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={onRefresh}>
                    <RefreshCw className="size-3.5" />
                    Refresh
                </Button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                    <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3 font-medium">Purpose</th>
                            <th className="px-4 py-3 font-medium">Transaction ID</th>
                            <th className="px-4 py-3 font-medium">Date</th>
                            <th className="px-4 py-3 font-medium">Amount</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((record) => {
                            const displayStatus = mapStatus(record.status);
                            return (
                                <tr
                                    key={record.id}
                                    className="border-b border-border/60 last:border-0 hover:bg-surface-secondary/40 transition-colors"
                                >
                                    <td className="px-4 py-4 font-medium text-foreground">
                                        {record.purpose ?? "Business verification"}
                                    </td>
                                    <td className="px-4 py-4 text-xs text-muted-foreground font-mono">
                                        {record.paymentID ?? record.trxId ?? record.id}
                                    </td>
                                    <td className="px-4 py-4 text-muted-foreground">
                                        {formatDate(record.createdAt)}
                                    </td>
                                    <td className="px-4 py-4 font-semibold tabular-nums text-foreground">
                                        ৳{record.amount}
                                    </td>
                                    <td className="px-4 py-4">
                                        <Badge
                                            variant={
                                                displayStatus === "Paid"
                                                    ? "success"
                                                    : displayStatus === "Pending"
                                                        ? "warning"
                                                        : displayStatus === "Cancelled" || displayStatus === "Refunded"
                                                            ? "outline"
                                                            : "danger"
                                            }
                                            className="gap-1.5"
                                        >
                                            {displayStatus === "Paid" ? (
                                                <CheckCircle2 className="size-3" />
                                            ) : displayStatus === "Pending" ? (
                                                <Clock3 className="size-3" />
                                            ) : displayStatus === "Cancelled" || displayStatus === "Refunded" ? (
                                                <History className="size-3" />
                                            ) : (
                                                <XCircle className="size-3" />
                                            )}
                                            {displayStatus}
                                        </Badge>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SellerPayments() {
    const [activeTab, setActiveTab] = useState<Tab>("checkout");
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>("bkash");
    const [isPaying, setIsPaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Plan tier — the free listing-quota card is hidden for Pro sellers.
    const { tier, isLoading: isLoadingTier } = useSellerTier();
    const isPro = tier === "PRO";

    // Business
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [loadingBusiness, setLoadingBusiness] = useState(true);
    const [quotaError, setQuotaError] = useState<string | null>(null);

    // Payment history
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);

    // Quota
    const [quota, setQuota] = useState<ListingQuota | null>(null);

    // Load business + quota on mount
    useEffect(() => {
        let active = true;
        const load = async () => {
            const businessResult = await getMyBusinesses();
            if (!active) return;

            let resolvedBusinessId: string | null = null;
            if (!businessResult.ok || !businessResult.data) {
                setError(businessResult.message);
            } else if (businessResult.data.length > 0) {
                resolvedBusinessId = businessResult.data[0].id;
                setBusinessId(resolvedBusinessId);
            } else {
                setError("No business found. Please create a business before making a payment.");
            }

            const quotaResult = await getListingQuota(resolvedBusinessId ?? undefined);
            if (!active) return;

            if (quotaResult.ok && quotaResult.data) {
                setQuota(quotaResult.data);
                setQuotaError(null);
            } else {
                setQuota(null);
                setQuotaError(quotaResult.message);
            }
            setLoadingBusiness(false);
        };
        void load();
        return () => {
            active = false;
        };
    }, []);

    // Load history when switching to that tab
    const loadHistory = async () => {
        setLoadingHistory(true);
        setHistoryError(null);
        try {
            const result = await getMyPayments();
            if (!result.ok || !result.data) {
                setHistoryError(result.message);
                return;
            }
            setPayments(result.data);
        } catch (loadError) {
            console.error("Could not load payment history:", loadError);
            setHistoryError(
                loadError instanceof Error ? loadError.message : "Could not load payment history.",
            );
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        if (tab === "history") loadHistory();
    };

    const handlePay = async () => {
        if (!businessId) {
            setError("No business found. Please create a business before making a payment.");
            return;
        }
        setError(null);
        setIsPaying(true);
        try {
            const result = await initiateBkashPayment(businessId);
            sessionStorage.setItem("bkash_payment_amount", `৳${result.amount}`);
            window.location.assign(result.bkashURL);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not start checkout. Please try again."
            );
            setIsPaying(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6">
            <SellerPageHeader
                icon={CreditCard}
                title="Payments"
                description="Pay your business verification fee to unlock your seller listing slots."
            />

            {/* Quota banner — free sellers only (Pro sellers have no listing limit) */}
            {quota && !isLoadingTier && !isPro && <QuotaBanner quota={quota} />}
            {quotaError && (
                <div role="alert" className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
                    {quotaError}
                </div>
            )}

            {/* Tab switcher */}
            <div className="flex rounded-xl border border-border bg-surface p-1 w-fit">
                <Button
                    type="button"
                    size="sm"
                    variant={activeTab === "checkout" ? "secondary" : "ghost"}
                    className="gap-2"
                    onClick={() => handleTabChange("checkout")}
                >
                    <CreditCard className="size-4" />
                    Checkout
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={activeTab === "history" ? "secondary" : "ghost"}
                    className="gap-2"
                    onClick={() => handleTabChange("history")}
                >
                    <History className="size-4" />
                    History
                </Button>
            </div>

            {/* Checkout view */}
            {activeTab === "checkout" && (
                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                    <Card className="border-border/80 bg-surface shadow-surface">
                        <CardHeader>
                            <CardTitle>Choose payment method</CardTitle>
                            <CardDescription>
                                Select how you want to pay for your business verification.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {PAYMENT_METHODS.map((method) => (
                                <PaymentMethodCard
                                    key={method.id}
                                    method={method}
                                    selected={selectedMethod === method.id}
                                    onSelect={() => setSelectedMethod(method.id)}
                                />
                            ))}

                            <div className="rounded-xl border border-border bg-background/50 px-4 py-3 text-sm text-muted-foreground">
                                You will be redirected to the bKash payment page to complete
                                your transaction securely.
                            </div>

                            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                    <BadgeCheck className="size-4 shrink-0" />
                                    What you unlock
                                </div>
                                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                                    <li>• 1 verified business listing slot</li>
                                    <li>• Verified badge on your business profile</li>
                                    <li>• Access to the seller marketplace</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <OrderSummary
                        amount="৳500"
                        purpose="Business verification fee"
                        error={error}
                        isPaying={isPaying}
                        disabled={loadingBusiness || !businessId}
                        onPay={handlePay}
                    />
                </div>
            )}

            {/* History view */}
            {activeTab === "history" && (
                <Card className="border-border/80 bg-surface shadow-surface">
                    <CardHeader>
                        <CardTitle>Payment history</CardTitle>
                        <CardDescription>
                            All your past payments and their current status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {historyError && (
                            <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
                                <span>{historyError}</span>
                                <Button type="button" variant="outline" size="sm" onClick={() => void loadHistory()}>
                                    Try again
                                </Button>
                            </div>
                        )}
                        {historyError && payments.length === 0 ? null : (
                            <PaymentHistoryTable
                                records={payments}
                                loading={loadingHistory}
                                onRefresh={() => void loadHistory()}
                            />
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
