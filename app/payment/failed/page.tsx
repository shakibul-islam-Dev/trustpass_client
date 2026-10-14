"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    Loader2,
    RefreshCw,
    XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPaymentById, type PaymentRecord } from "@/lib/core/bkash-api";

// ---------------------------------------------------------------------------
// bKash failure callback:
//   /payment/failed?paymentId=<internal-id>&status=failure
// ---------------------------------------------------------------------------

function FailedView() {
    const router = useRouter();
    const params = useSearchParams();

    const paymentId = params.get("paymentId") ?? "";
    const rawStatus = params.get("status") ?? "failure";

    const isCancelled = rawStatus === "cancel";

    const [payment, setPayment] = useState<PaymentRecord | null>(null);
    const [loading, setLoading] = useState(Boolean(paymentId));

    useEffect(() => {
        if (!paymentId) return;
        getPaymentById(paymentId).then((record) => {
            setPayment(record);
            setLoading(false);
        });
    }, [paymentId]);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="size-8 animate-spin" />
                    <p className="text-sm">Loading payment details…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[60vh] items-center justify-center p-4">
            <Card className="w-full max-w-md border-border/80 bg-surface shadow-surface">
                <CardContent className="space-y-6 p-6 sm:p-8 text-center">

                    {/* Status icon */}
                    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <XCircle className="size-8" />
                    </div>

                    {/* Heading */}
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">
                            {isCancelled ? "Payment cancelled" : "Payment failed"}
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {isCancelled
                                ? "You cancelled the payment. No charge was made to your account."
                                : "Your payment could not be processed. No charge was made. Please try again."}
                        </p>
                    </div>

                    {/* Details */}
                    <div className="rounded-xl border border-border bg-background/50 p-4 text-left space-y-3 text-sm">
                        {paymentId && (
                            <div className="flex justify-between gap-3">
                                <span className="text-muted-foreground">Payment ID</span>
                                <span className="font-mono text-xs text-foreground break-all text-right">
                                    {paymentId}
                                </span>
                            </div>
                        )}

                        {payment?.amount && (
                            <div className="flex justify-between gap-3">
                                <span className="text-muted-foreground">Amount</span>
                                <span className="font-semibold text-foreground tabular-nums">
                                    ৳{payment.amount}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant="danger">
                                {isCancelled ? "Cancelled" : "Failed"}
                            </Badge>
                        </div>
                    </div>

                    {/* What to do next */}
                    <div className="rounded-xl border border-border bg-background/40 px-4 py-3 text-left text-xs text-muted-foreground space-y-1">
                        <p className="font-medium text-foreground text-sm">What you can do:</p>
                        <ul className="space-y-1 mt-1">
                            <li>• Check your bKash account has sufficient balance</li>
                            <li>• Ensure your bKash PIN is correct</li>
                            <li>• Try again or contact bKash support</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={() => router.push("/dashboard/seller/payments")}
                            className="gap-2"
                        >
                            <RefreshCw className="size-4" />
                            Try again
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => router.push("/dashboard/seller")}
                        >
                            <ArrowLeft className="size-4" />
                            Back to dashboard
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}

export default function PaymentFailedPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[60vh] items-center justify-center">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
            }
        >
            <FailedView />
        </Suspense>
    );
}
