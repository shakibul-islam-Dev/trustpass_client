"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentsTable } from "./PaymentsTable";
import { PaymentDetailsModal } from "./PaymentDetailsModal";
import type { IPaymentResponse } from "@/lib/admin_api/get-payments";

interface PaymentsClientProps {
  initialPayments: IPaymentResponse[];
}

export const PaymentsClient = ({ initialPayments }: PaymentsClientProps) => {
  const [payments] = useState<IPaymentResponse[]>(initialPayments);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] =
    useState<IPaymentResponse | null>(null);

  const openDetailsModal = (payment: IPaymentResponse) => {
    setSelectedPayment(payment);
    setIsDetailsOpen(true);
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        (payment.transactionId || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (payment.userName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (payment.userEmail || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (payment.businessName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        String(payment.status || "").toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [payments, searchTerm, statusFilter]);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by transaction, payer, or business..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v ?? "all")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <PaymentsTable
        payments={filteredPayments}
        onViewDetails={openDetailsModal}
      />

      <PaymentDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        payment={selectedPayment}
      />
    </>
  );
};