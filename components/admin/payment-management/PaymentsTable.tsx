"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { IPaymentResponse } from "@/lib/admin_api/get-payments";

interface PaymentsTableProps {
  payments: IPaymentResponse[];
  onViewDetails: (payment: IPaymentResponse) => void;
}

const PAGE_SIZE = 20;

const getStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
  const s = String(status || "").toUpperCase();
  if (s === "SUCCESS" || s === "COMPLETED" || s === "PAID") return "default";
  if (s === "FAILED" || s === "CANCELLED") return "destructive";
  if (s === "PENDING") return "secondary";
  return "outline";
};

// ── Copyable ID ──
const CopyableId = ({
  id,
  label,
  compact = true,
}: {
  id: string;
  label: string;
  compact?: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      toast.success(`${label} copied!`);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const display =
    compact && id.length > 12
      ? `${id.slice(0, 8)}...${id.slice(-4)}`
      : id;

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Copy ${label}`}
      className="group inline-flex items-center gap-1.5 font-mono text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80 transition max-w-[180px]"
    >
      <span className="truncate">{display}</span>
      {copied ? (
        <Check className="h-3 w-3 text-success shrink-0" />
      ) : (
        <Copy className="h-3 w-3 opacity-40 group-hover:opacity-100 transition shrink-0" />
      )}
    </button>
  );
};

export const PaymentsTable = ({
  payments,
  onViewDetails,
}: PaymentsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(payments.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginated = payments.slice(startIndex, endIndex);

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[60px]">#</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Payer</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Business ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-8 text-muted-foreground"
                >
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((payment, index) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-muted-foreground text-sm">
                    {startIndex + index + 1}
                  </TableCell>

                  {/* Transaction ID */}
                  <TableCell>
                    {payment.bkashTrxId ? (
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        {payment.bkashTrxId}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  {/* Payer — name + email */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {payment.userName || "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                        {payment.userEmail || "-"}
                      </span>
                    </div>
                  </TableCell>

                  {/* ✅ User ID — copyable (notification) */}
                  <TableCell>
                    {payment.userId ? (
                      <CopyableId id={payment.userId} label="User ID" />
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  {/* Business name */}
                  <TableCell className="text-sm">
                    {payment.businessName || "-"}
                  </TableCell>

                  {/* ✅ Business ID — copyable */}
                  <TableCell>
                    {payment.businessId ? (
                      <CopyableId
                        id={payment.businessId}
                        label="Business ID"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  {/* Amount */}
                  <TableCell className="font-medium">
                    {payment.currency} {payment.amount.toLocaleString()}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge variant={getStatusVariant(payment.status)}>
                      {payment.status}
                    </Badge>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="text-muted-foreground text-sm">
                    {payment.createdAt
                      ? new Date(payment.createdAt).toLocaleDateString()
                      : "-"}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem
                          onClick={() => onViewDetails(payment)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {payments.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}–{Math.min(endIndex, payments.length)} of{" "}
            {payments.length} payments
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};