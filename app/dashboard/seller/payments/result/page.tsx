"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * bKash redirects back here after the user completes or cancels payment.
 *
 * bKash query params:
 *   ?paymentID=TR0011...   bKash transaction ID
 *   &status=success|cancel|failure
 *
 * The amount is not returned by bKash — we store it in sessionStorage
 * before redirecting so we can show it here.
 */
function PaymentResultView() {
    const router = useRouter();
    const params = useSearchParams();

    const rawStatus = params.get("status") ?? "";
    const succeeded = rawStatus === "success";

    // bKash sends back paymentID in the callback URL
    const paymentID = params.get("paymentID") ?? undefined;

    // Amount was stored in sessionStorage before we redirected to bKash
    const amount =
        typeof window !== "undefined"
            ? (sessionStorage.getItem("bkash_payment_amount") ?? undefined)
            : undefined;

    return (
        <div className="flex min-h-[60vh] items-center justify-center p-4">
            <Card className="w-full max-w-md border-border/80 bg-surface shadow-surface">
                <CardContent className="space-y-6 p-6 sm:p-8 text-center">
                    {/* Icon */}
                    <div
                        className={`mx-auto flex size-16 items-center justify-center rounded-full ${succeeded
                                ? "bg-success/10 text-success"
                                : "bg-destructive/10 text-destructive"
                            }`}
                    >
                        {succeeded ? (
                            <CheckCircle2 className="size-8" />
                        ) : (
                            <XCircle className="size-8" />
                        )}
                    </div>

                    {/* Heading */}
                    <div>
                        <h2 className="text-2xl font-semibold text-foreground">
                            {succeeded
                                ? "Payment successful"
                                : rawStatus === "cancel"
                                    ? "Payment cancelled"
                                    : "Payment failed"}
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {succeeded
                                ? "Your verification fee has been received. Your listing slot will be unlocked shortly."
                                : rawStatus === "cancel"
                                    ? "You cancelled the payment. No charge was made."
                                    : "The payment could not be completed. Please try again."}
                        </p>
                    </div>

                    {/* Details */}
                    <div className="rounded-xl border border-border bg-background/50 p-4 text-left space-y-3 text-sm">
                        {amount && (
                            <div className="flex justify-between gap-3">
                                <span className="text-muted-foreground">Amount</span>
                                <span className="font-semibold text-foreground tabular-nums">
                                    {amount}
                                </span>
                            </div>
                        )}
                        {paymentID && (
                            <div className="flex justify-between gap-3">
                                <span className="text-muted-foreground">Transaction ID</span>
                                <span className="font-mono text-xs text-foreground break-all text-right">
                                    {paymentID}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant={succeeded ? "success" : "danger"}>
                                {succeeded ? "Paid" : "Not paid"}
                            </Badge>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => router.push("/dashboard/seller/payments")}
                        >
                            <ArrowLeft className="size-4" />
                            Back to payments
                        </Button>
                        {!succeeded && (
                            <Button
                                onClick={() => router.push("/dashboard/seller/payments")}
                            >
                                Try again
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function PaymentResultPage() {
    return (
        <Suspense
            fallback={
                <p className="text-center text-sm text-muted-foreground">
                    Loading…
                </p>
            }
        >
            <PaymentResultView />
        </Suspense>
    );
}
