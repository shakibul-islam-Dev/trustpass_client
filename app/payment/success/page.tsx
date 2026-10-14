"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    CheckCircle2,
    ExternalLink,
    Loader2,
    ReceiptText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPaymentById, type PaymentRecord } from "@/lib/core/bkash-api";

// ---------------------------------------------------------------------------
// bKash success callback:
//   /payment/success?paymentId=<internal-id>&trxId=<bkash-trx>&status=success
// ---------------------------------------------------------------------------

function SuccessView() {
    const router = useRouter();
    const params = useSearchParams();

    const paymentId = params.get("paymentId") ?? "";
    const trxId = params.get("trxId") ?? "";

    const [payment, setPayment] = useState<PaymentRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        if (!paymentId) {
            setLoading(false);
            return;
        }
        getPaymentById(paymentId).then((record) => {
            setPayment(record);
            // Treat as verified only when server confirms SUCCESS
            setVerified(record?.status === "SUCCESS");
            setLoading(false);
        });
    }, [paymentId]);

    const amount = payment?.amount
        ? `৳${payment.amount}`
        : sessionStorage.getItem("bkash_payment_amount") ?? "৳500";

    const displayTrxId = trxId || payment?.paymentID || payment?.trxId;

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="size-8 animate-spin" />
                    <p className="text-sm">Verifying your payment…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[60vh] items-center justify-center p-4">
            <Card className="w-full max-w-md border-border/80 bg-surface shadow-surface">
                <CardContent className="space-y-6 p-6 sm:p-8 text-center">

                    {/* Status icon */}
                    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
                        <CheckCircle2 className="size-8" />
                    </div>

                    {/* Heading */}
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">
                            Payment successful
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {verified
                                ? "Your verification fee has been confirmed. Your listing slot is now unlocked."
                                : "Payment received — verification is being processed."}
                        </p>
                    </div>

                    {/* Receipt */}
                    <div className="rounded-xl border border-border bg-background/50 p-4 text-left space-y-3 text-sm">
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground pb-1 border-b border-border">
                            <ReceiptText className="size-3.5" />
                            Receipt
                        </div>

                        <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">Amount paid</span>
                            <span className="font-semibold text-foreground tabular-nums">{amount}</span>
                        </div>

                        {displayTrxId && (
                            <div className="flex justify-between gap-3">
                                <span className="text-muted-foreground">Transaction ID</span>
                                <span className="font-mono text-xs text-foreground break-all text-right">
                                    {displayTrxId}
                                </span>
                            </div>
                        )}

                        {payment?.merchantInvoiceNumber && (
                            <div className="flex justify-between gap-3">
                                <span className="text-muted-foreground">Invoice</span>
                                <span className="font-mono text-xs text-foreground">
                                    {payment.merchantInvoiceNumber}
                                </span>
                            </div>
                        )}

                        {payment?.slotsToUnlock && (
                            <div className="flex justify-between gap-3">
                                <span className="text-muted-foreground">Slots unlocked</span>
                                <span className="font-medium text-foreground">
                                    {payment.slotsToUnlock}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant="success">Paid</Badge>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={() => router.push("/dashboard/seller")}
                            className="gap-2"
                        >
                            <ExternalLink className="size-4" />
                            Go to dashboard
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => router.push("/dashboard/seller/payments")}
                        >
                            <ArrowLeft className="size-4" />
                            View payment history
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[60vh] items-center justify-center">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
            }
        >
            <SuccessView />
        </Suspense>
    );
}
