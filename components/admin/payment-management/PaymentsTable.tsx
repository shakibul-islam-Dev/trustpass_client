"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
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
  if (s === "COMPLETED" || s === "SUCCESS" || s === "PAID") return "default";
  if (s === "FAILED" || s === "CANCELLED") return "destructive";
  if (s === "PENDING") return "secondary";
  return "outline";
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

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[60px]">#</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Payer</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
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
                  <TableCell className="font-mono text-xs">
                    {payment.transactionId
                      ? payment.transactionId.length > 16
                        ? `${payment.transactionId.slice(0, 12)}...`
                        : payment.transactionId
                      : payment.id.slice(0, 12)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {payment.userName || "-"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {payment.userEmail || "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {payment.businessName || "-"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {payment.currency} {payment.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {payment.method || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(payment.status)}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {payment.createdAt
                      ? new Date(payment.createdAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
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