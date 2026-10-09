"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PaymentResult } from "@/components/seller/SellerPaymentCenter";

function PaymentResultView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") === "success" ? "success" : "failure";
  const amount = searchParams.get("amount") ?? undefined;
  const reference = searchParams.get("reference") ?? undefined;

  return (
    <PaymentResult
      status={status}
      amount={amount}
      reference={reference}
      onBack={() => router.push("/dashboard/seller/payments")}
      onRetry={() => router.push("/dashboard/seller/payments")}
    />
  );
}

export default function PaymentResultPage() {
  return (
    <div className="p-4 md:p-6 xl:p-8">
      {/* useSearchParams needs a Suspense boundary in the app router. */}
      <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Loading…</p>}>
        <PaymentResultView />
      </Suspense>
    </div>
  );
}