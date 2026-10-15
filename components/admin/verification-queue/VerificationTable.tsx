"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Copy,
  Check,
  CheckCircle2,
  XCircle as XCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import type { IVerificationResponse } from "@/lib/admin_api/get-verifications";

interface VerificationTableProps {
  requests: IVerificationResponse[];
  onViewDetails: (request: IVerificationResponse) => void;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

const PAGE_SIZE = 20;

const formatSubmittedAt = (value?: string): string => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

const getStatusVariant = (status: string | undefined) => {
  switch (String(status || "PENDING").toUpperCase()) {
    case "APPROVED":
      return "default";
    case "REJECTED":
    case "SUSPENDED":
      return "destructive";
    default:
      return "secondary";
  }
};

// ── Copyable ID ──
const CopyableId = ({ id }: { id: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      toast.success("Owner ID copied!");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Click to copy Owner ID"
      className="group inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition"
    >
      <span className="truncate max-w-[110px]">
        {id.slice(0, 8)}...{id.slice(-4)}
      </span>
      {copied ? (
        <Check className="h-3 w-3 text-success shrink-0" />
      ) : (
        <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition shrink-0" />
      )}
    </button>
  );
};

export const VerificationTable = ({
  requests,
  onViewDetails,
  onApprove,
  onReject,
}: VerificationTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(requests.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginated = requests.slice(startIndex, endIndex);

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
              <TableHead>Business</TableHead>
              <TableHead>Owner ID</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No verification requests found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((req, index) => {
                const docs = req.documents ?? [];
                const approvedDocs = docs.filter(
                  (d) => String(d.status).toUpperCase() === "APPROVED"
                ).length;

                const isApproved = req.status === "APPROVED";
                const isRejected = req.status === "REJECTED";
                const isSuspended = req.status === "SUSPENDED";
                const isPending =
                  !isApproved && !isRejected && !isSuspended;

                return (
                  <TableRow key={req.id}>
                    <TableCell className="text-muted-foreground text-sm">
                      {startIndex + index + 1}
                    </TableCell>

                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{req.businessName}</span>
                        <span className="text-xs text-muted-foreground">
                          {req.businessSlug ? `@${req.businessSlug}` : "-"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {req.ownerId ? (
                        <CopyableId id={req.ownerId} />
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <FileText className="h-3 w-3" />
                        {approvedDocs}/{docs.length}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant={getStatusVariant(req.status)}>
                        {String(req.status || "PENDING").replace(/_/g, " ")}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {formatSubmittedAt(req.submittedAt)}
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
                        <DropdownMenuContent align="end" className="w-[240px]">
                          {/* View — always enabled */}
                          <DropdownMenuItem onClick={() => onViewDetails(req)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Documents
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {/* ✅ APPROVE — disabled + faded if already approved */}
                          {isApproved ? (
                            <DropdownMenuItem
                              disabled
                              className="opacity-60 cursor-not-allowed text-success focus:bg-transparent"
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              <span>Already Approved</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => onApprove(req.id)}
                              disabled={isSuspended || isRejected}
                              className={
                                isSuspended || isRejected
                                  ? "opacity-50 cursor-not-allowed"
                                  : "text-success focus:text-success focus:bg-success-soft"
                              }
                              title={
                                isSuspended
                                  ? "Suspended — cannot approve"
                                  : isRejected
                                  ? "Already rejected"
                                  : "Approve request"
                              }
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve Request
                            </DropdownMenuItem>
                          )}

                          {/* ✅ REJECT — disabled + faded if already rejected */}
                          {isRejected ? (
                            <DropdownMenuItem
                              disabled
                              className="opacity-60 cursor-not-allowed text-destructive focus:bg-transparent"
                            >
                              <XCircleIcon className="mr-2 h-4 w-4" />
                              <span>Already Rejected</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => onReject(req.id)}
                              disabled={isSuspended || isApproved}
                              className={
                                isSuspended || isApproved
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }
                              title={
                                isSuspended
                                  ? "Suspended — cannot reject"
                                  : isApproved
                                  ? "Already approved"
                                  : "Reject request"
                              }
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject Request
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {requests.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}–{Math.min(endIndex, requests.length)} of{" "}
            {requests.length} requests
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