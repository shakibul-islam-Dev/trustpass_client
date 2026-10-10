"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Calendar,
  Hash,
  User,
  Building2,
  DollarSign,
  Package,
} from "lucide-react";
import type { IPaymentResponse } from "@/lib/admin_api/get-payments";

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: IPaymentResponse | null;
}

const getStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
  const s = String(status || "").toUpperCase();
  if (s === "COMPLETED" || s === "SUCCESS" || s === "PAID") return "default";
  if (s === "FAILED" || s === "CANCELLED") return "destructive";
  if (s === "PENDING") return "secondary";
  return "outline";
};

export const PaymentDetailsModal = ({
  isOpen,
  onClose,
  payment,
}: PaymentDetailsModalProps) => {
  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Details
          </DialogTitle>
          <DialogDescription>
            Transaction information for this payment.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-5">
          {/* Status Badges */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant={getStatusVariant(payment.status)}>
              {payment.status}
            </Badge>
            <Badge variant="outline">
              {payment.currency} {payment.amount.toLocaleString()}
            </Badge>
            {payment.gateway && (
              <Badge variant="outline">{payment.gateway}</Badge>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <Hash className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-muted-foreground">Transaction ID</p>
                <p className="font-medium font-mono text-xs break-all">
                  {payment.transactionId || payment.id}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">
                  {payment.createdAt
                    ? new Date(payment.createdAt).toLocaleString()
                    : "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-muted-foreground">Payer</p>
                <p className="font-medium">{payment.userName || "-"}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {payment.userEmail || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-muted-foreground">Business</p>
                <p className="font-medium">{payment.businessName || "-"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-medium text-lg">
                  {payment.currency} {payment.amount.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Package className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground">Method</p>
                <p className="font-medium">{payment.method || "-"}</p>
              </div>
            </div>
          </div>

          {/* Reference (if any) */}
          {payment.reference && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Reference</p>
              <code className="block text-xs bg-muted p-2 rounded font-mono break-all">
                {payment.reference}
              </code>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};