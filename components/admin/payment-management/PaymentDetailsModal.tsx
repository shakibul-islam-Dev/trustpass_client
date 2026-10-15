"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Calendar,
  Hash,
  User,
  Building2,
  DollarSign,
  Package,
  Copy,
  Check,
  Phone,
  Layers,
  Mail,
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
  if (s === "SUCCESS" || s === "COMPLETED" || s === "PAID") return "default";
  if (s === "FAILED" || s === "CANCELLED") return "destructive";
  if (s === "PENDING") return "secondary";
  return "outline";
};

const CopyableId = ({ id, label }: { id: string; label: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      toast.success(`${label} copied!`);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group inline-flex items-start gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition break-all text-left"
      title="Click to copy"
    >
      <span className="break-all">{id}</span>
      {copied ? (
        <Check className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
      ) : (
        <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition shrink-0 mt-0.5" />
      )}
    </button>
  );
};

export const PaymentDetailsModal = ({
  isOpen,
  onClose,
  payment,
}: PaymentDetailsModalProps) => {
  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
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
            {payment.purpose && (
              <Badge variant="outline" className="gap-1">
                <Package className="h-3 w-3" />
                {String(payment.purpose).replace(/_/g, " ")}
              </Badge>
            )}
            {payment.slotsUnlocked && (
              <Badge variant="outline" className="gap-1">
                <Layers className="h-3 w-3" />
                {payment.slotsUnlocked} slot
                {payment.slotsUnlocked > 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          <Separator />

          {/* Payer Info */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Payer Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{payment.userName || "-"}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium break-all">
                    {payment.userEmail || "-"}
                  </p>
                </div>
              </div>

              {/* ✅ User ID — copyable */}
              {payment.userId && (
                <div className="flex items-start gap-2 sm:col-span-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 w-full">
                    <p className="text-muted-foreground">User ID</p>
                    <CopyableId id={payment.userId} label="User ID" />
                  </div>
                </div>
              )}

              {payment.payerAccount && (
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-muted-foreground">Payer Account</p>
                    <p className="font-medium">{payment.payerAccount}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Business Info */}
          {(payment.businessName || payment.businessId) && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="text-sm font-semibold">Business Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {payment.businessName && (
                    <div className="flex items-start gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-muted-foreground">Name</p>
                        <p className="font-medium">{payment.businessName}</p>
                        {payment.businessSlug && (
                          <p className="text-xs text-muted-foreground">
                            @{payment.businessSlug}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {payment.businessId && (
                    <div className="flex items-start gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 w-full">
                        <p className="text-muted-foreground">Business ID</p>
                        <CopyableId
                          id={payment.businessId}
                          label="Business ID"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Payment Info */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Payment Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {payment.createdAt
                      ? new Date(payment.createdAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
              </div>

              {payment.bkashTrxId && (
                <div className="flex items-start gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 w-full">
                    <p className="text-muted-foreground">bKash Trx ID</p>
                    <CopyableId
                      id={payment.bkashTrxId}
                      label="bKash Trx ID"
                    />
                  </div>
                </div>
              )}

              {payment.bkashPaymentId && (
                <div className="flex items-start gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 w-full">
                    <p className="text-muted-foreground">bKash Payment ID</p>
                    <CopyableId
                      id={payment.bkashPaymentId}
                      label="Payment ID"
                    />
                  </div>
                </div>
              )}

              {payment.merchantInvoiceNumber && (
                <div className="flex items-start gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 w-full">
                    <p className="text-muted-foreground">Invoice Number</p>
                    <CopyableId
                      id={payment.merchantInvoiceNumber}
                      label="Invoice Number"
                    />
                  </div>
                </div>
              )}

              {payment.bkashExecuteTime && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-muted-foreground">Executed At</p>
                    <p className="font-medium">
                      {new Date(payment.bkashExecuteTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
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