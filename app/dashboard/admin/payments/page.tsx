"use client";

import { useState, useEffect } from "react";
import { PaymentsClient } from "@/components/admin/payment-management/PaymentsClient";
import {
  fetchAllPayments,
  type IPaymentResponse,
} from "@/lib/admin_api/get-payments";

/**
 * Admin Payments Management page.
 * Lists all payments (ADMIN scope — GET /api/v1/payments).
 * Not part of Section 15 (Shakibul's buyer payment scope).
 *
 * Implemented by: Aritro (Admin scope).
 */
export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<IPaymentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAllPayments({ page: 1, limit: 200 });
        setPayments(data);
      } catch (error) {
        console.error("Failed to load payments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Payments</h1>
        <p className="text-muted-foreground mt-1">
          Browse and monitor all payment transactions.
        </p>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading payments...</div>
      ) : (
        <PaymentsClient initialPayments={payments} />
      )}
    </div>
  );
}