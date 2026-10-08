"use client";

import { useState } from "react";
import { ArrowDownToLine, ArrowLeft, ArrowRight, CheckCircle2, Clock3, CreditCard, History, ShieldCheck, Wallet, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PaymentMethod = "card" | "mobile" | "bank";

export interface SellerPaymentRecord {
  id: string;
  purpose: string;
  date: string;
  amount: string;
  status: "Paid" | "Pending" | "Failed";
}

interface SellerPaymentCenterProps {
  payments?: SellerPaymentRecord[];
  amount: string;
  purpose?: string;
  onPay?: (method: PaymentMethod, amount: string) => void | Promise<void>;
  isLoadingHistory?: boolean;
  historyError?: string | null;
}

export default function SellerPaymentCenter({
  payments = [],
  amount,
  purpose = "Business verification",
  onPay,
  isLoadingHistory = false,
  historyError,
}: SellerPaymentCenterProps) {
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [view, setView] = useState<"checkout" | "history">("checkout");
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const hasAmount = Boolean(amount.trim());

  const handlePay = async () => {
    if (!onPay) return;
    setPaymentError(null);
    setIsPaying(true);
    try {
      await onPay(method, amount);
    } catch (error) {
      console.error("Payment checkout could not start:", error);
      setPaymentError(error instanceof Error ? error.message : "Could not start checkout. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };

  const methodOptions: { id: PaymentMethod; title: string; description: string; icon: typeof CreditCard }[] = [
    { id: "card", title: "Debit or credit card", description: "Visa, Mastercard, and supported cards", icon: CreditCard },
    { id: "mobile", title: "Mobile financial service", description: "Mobile wallet or bank app", icon: Wallet },
    { id: "bank", title: "Bank transfer", description: "Pay from your bank account", icon: ShieldCheck },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Payments</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage verification fees and payment history.</p>
        </div>
        <div className="flex rounded-xl border border-border bg-surface p-1">
          <Button type="button" size="sm" variant={view === "checkout" ? "secondary" : "ghost"} className="gap-2" onClick={() => setView("checkout")}>
            <CreditCard className="size-4" /> Checkout
          </Button>
          <Button type="button" size="sm" variant={view === "history" ? "secondary" : "ghost"} className="gap-2" onClick={() => setView("history")}>
            <History className="size-4" /> History
          </Button>
        </div>
      </div>

      {view === "checkout" ? (
        <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
          <Card className="border-border/80 bg-surface shadow-surface">
            <CardHeader>
              <CardTitle>Choose payment method</CardTitle>
              <CardDescription>Choose a payment method for {purpose.toLowerCase()}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {methodOptions.map(({ id, title, description, icon: Icon }) => {
                const selected = method === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setMethod(id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors ${selected ? "border-primary bg-primary/5 ring-2 ring-primary/15" : "border-border bg-background/40 hover:bg-surface-secondary"}`}
                  >
                    <span className={`flex size-10 items-center justify-center rounded-lg ${selected ? "bg-primary text-primary-foreground" : "bg-surface-secondary text-muted-foreground"}`}><Icon className="size-5" /></span>
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-foreground">{title}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{description}</span>
                    </span>
                    <span className={`size-4 rounded-full border ${selected ? "border-[5px] border-primary" : "border-border"}`} aria-hidden="true" />
                  </button>
                );
              })}

              <div className="rounded-xl border border-border bg-background/50 p-4 text-sm text-muted-foreground">
                {method === "card"
                  ? "Card details will be entered in the payment provider’s secure checkout."
                  : "You will choose your provider in the secure payment step."}
              </div>
              <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-success" />
                Payment details are handled by the payment provider.
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit border-border/80 bg-surface shadow-surface">
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
              <CardDescription>Business verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-muted-foreground">{purpose}</span>
                <span className="font-medium text-foreground">{amount}</span>
              </div>
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-muted-foreground">Processing fee</span>
                <span className="font-medium text-foreground">৳0.00</span>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between gap-3">
                  <span className="font-semibold text-foreground">Total due</span>
                  <span className="text-lg font-bold tabular-nums text-foreground">{amount}</span>
                </div>
              </div>
              {paymentError && <p role="alert" className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{paymentError}</p>}
              <Button type="button" className="w-full gap-2" disabled={!onPay || !hasAmount || isPaying} onClick={() => void handlePay()}>
                {isPaying ? "Starting checkout…" : `Pay ${amount}`}
                <ArrowRight className="size-4" />
              </Button>
              {!onPay && <p className="text-xs leading-5 text-muted-foreground">Payment is disabled until a secure payment handler is connected.</p>}
              {!hasAmount && <p className="text-xs leading-5 text-danger">Provide the payment amount to enable checkout.</p>}
              <p className="text-center text-xs text-muted-foreground">By continuing, you agree to the payment terms.</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-border/80 bg-surface shadow-surface">
          <CardHeader>
            <CardTitle>Payment history</CardTitle>
            <CardDescription>Recent charges and their current status.</CardDescription>
          </CardHeader>
          <CardContent>
            {historyError && <p role="alert" className="mb-4 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{historyError}</p>}
            {isLoadingHistory ? (
              <p role="status" className="rounded-lg border border-border bg-background/50 p-8 text-center text-sm text-muted-foreground">Loading payment history…</p>
            ) : payments.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-background/40 p-8 text-center text-sm text-muted-foreground">No payment history is available.</p>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3 font-medium">Payment</th>
                    <th className="px-3 py-3 font-medium">Date</th>
                    <th className="px-3 py-3 font-medium">Amount</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium"><span className="sr-only">Receipt</span></th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-border/70 last:border-0">
                      <td className="px-3 py-4">
                        <p className="font-medium text-foreground">{payment.purpose}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{payment.id}</p>
                      </td>
                      <td className="px-3 py-4 text-muted-foreground">{payment.date}</td>
                      <td className="px-3 py-4 font-medium tabular-nums text-foreground">{payment.amount}</td>
                      <td className="px-3 py-4">
                        <Badge variant={payment.status === "Paid" ? "success" : payment.status === "Pending" ? "warning" : "danger"} className="gap-1.5">
                          {payment.status === "Paid" ? <CheckCircle2 className="size-3.5" /> : payment.status === "Pending" ? <Clock3 className="size-3.5" /> : <XCircle className="size-3.5" />}
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-4 text-right">
                        {payment.status === "Paid" && <Button type="button" variant="ghost" size="icon-sm" aria-label={`Download receipt ${payment.id}`}><ArrowDownToLine className="size-4" /></Button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function PaymentResult({ status, reference, amount, onRetry, onBack }: {
  status: "success" | "failure";
  reference?: string;
  amount?: string;
  onRetry?: () => void;
  onBack?: () => void;
}) {
  const succeeded = status === "success";

  return (
    <Card className="mx-auto w-full max-w-lg border-border/80 bg-surface text-center shadow-surface">
      <CardContent className="space-y-5 p-6 sm:p-8">
        <div className={`mx-auto flex size-16 items-center justify-center rounded-full ${succeeded ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {succeeded ? <CheckCircle2 className="size-8" /> : <XCircle className="size-8" />}
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{succeeded ? "Payment successful" : "Payment could not be completed"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {succeeded ? "Your payment has been recorded. A receipt will be available in payment history." : "No payment was confirmed. Check your payment method or try again."}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background/50 p-4 text-left">
          <div className="flex justify-between gap-3 text-sm"><span className="text-muted-foreground">Amount</span><span className="font-semibold text-foreground">{amount ?? "—"}</span></div>
          {reference && <div className="mt-3 flex justify-between gap-3 text-sm"><span className="text-muted-foreground">Reference</span><span className="font-medium text-foreground">{reference}</span></div>}
          <div className="mt-3 flex justify-between gap-3 text-sm"><span className="text-muted-foreground">Status</span><Badge variant={succeeded ? "success" : "danger"}>{succeeded ? "Paid" : "Not paid"}</Badge></div>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          {onBack && <Button type="button" variant="outline" className="gap-2" onClick={onBack}><ArrowLeft className="size-4" />Back to payments</Button>}
          {!succeeded && onRetry && <Button type="button" onClick={onRetry}>Try again</Button>}
        </div>
        <p className="text-xs text-muted-foreground">Only display a successful result after payment is verified by the payment provider.</p>
      </CardContent>
    </Card>
  );
}
