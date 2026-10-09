"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SellerPaymentCenter, {
  type SellerPaymentRecord,
} from "@/components/seller/SellerPaymentCenter";

type PaymentMethod = "card" | "mobile" | "bank";

/**
 * Buyer fee payments — UI only for now.
 *
 * The server does not expose a payment endpoint yet (see the server
 * API_CONTEXT.md: "No matching payment API is registered"), so checkout
 * records a local payment entry and opens the result page. Once a payment
 * provider API exists, replace `handlePay` with a real redirect/call.
 */
export default function SellerPaymentsPage() {
  const router = useRouter();
  const [history, setHistory] = useState<SellerPaymentRecord[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const handlePay = async (_method: PaymentMethod, amount: string) => {
    // Simulate the checkout round trip so the result page has data to show.
    await new Promise((resolve) => setTimeout(resolve, 900));
    const reference = `TP-${Date.now().toString().slice(-8)}`;

    setHistory((current) => [
      {
        id: reference,
        purpose: "Business verification",
        date: new Date().toISOString().slice(0, 10),
        amount,
        status: "Paid",
      },
      ...current,
    ]);
    setHistoryError(null);

    router.push(
      `/dashboard/seller/payments/result?status=success&amount=${encodeURIComponent(amount)}&reference=${reference}`,
    );
  };

  return (
    <div className="p-4 md:p-6 xl:p-8">
      <SellerPaymentCenter
        amount="৳500"
        purpose="Business verification"
        payments={history}
        onPay={handlePay}
        historyError={historyError}
      />
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Demo only — a payment provider is not connected yet, so checkout is simulated locally.
      </p>
    </div>
  );
}