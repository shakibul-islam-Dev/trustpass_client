'use client';

import { useState } from "react";
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
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

export const VerificationTable = ({
  requests,
  onViewDetails,
  onApprove,
  onReject,
}: VerificationTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(requests.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginated = requests.slice(startIndex, endIndex);

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
              <TableHead>Business</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Trust Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  No verification requests found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((req, index) => (
                <TableRow key={req.id}>
                  <TableCell className="text-muted-foreground text-sm">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{req.businessName}</span>
                      <span className="text-xs text-muted-foreground">
                        {req.tradeLicenseNo}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{req.ownerName}</span>
                      <span className="text-xs text-muted-foreground">
                        {req.ownerEmail}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{req.category}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        (req.trustScore ?? 0) >= 80
                          ? "default"
                          : (req.trustScore ?? 0) >= 50
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {req.trustScore ?? 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        req.status === "APPROVED"
                          ? "default"
                          : req.status === "REJECTED" ||
                            req.status === "SUSPENDED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {String(req.status || "PENDING").replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {req.submittedAt
                      ? new Date(req.submittedAt).toLocaleDateString()
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
                      <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuItem onClick={() => onViewDetails(req)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Documents
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => onApprove(req.id)}
                          disabled={req.status === "APPROVED"}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onReject(req.id)}
                          disabled={req.status === "REJECTED"}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
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