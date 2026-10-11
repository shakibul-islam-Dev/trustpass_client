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
import type { IReportResponse } from "@/lib/admin_api/get-reports";

interface ReportsTableProps {
  reports: IReportResponse[];
  onViewDetails: (report: IReportResponse) => void;
}

const PAGE_SIZE = 20;

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "secondary",
  REVIEWED: "outline",
  RESOLVED: "default",
  REJECTED: "destructive",
};

export const ReportTable = ({
  reports,
  onViewDetails,
}: ReportsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(reports.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginated = reports.slice(startIndex, endIndex);

  /**
   * Copies a user ID to the clipboard.
   * Used so the admin/moderator can paste it into the notification modal.
   */
  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      toast.success("User ID copied!");
      setTimeout(() => setCopiedId(null), 1500);
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Failed to copy ID.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[60px]">#</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
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
                  No reports found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((report, index) => {
                // The reporter's user ID — used for sending notifications
                const reporterId =
                  report.customerId || (report as any).reporterId || "";

                return (
                  <TableRow key={report.id}>
                    <TableCell className="text-muted-foreground text-sm">
                      {startIndex + index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {report.businessName || "Unknown"}
                    </TableCell>
                    <TableCell>{report.customerName || "-"}</TableCell>

                    {/* User ID with copy button */}
                    <TableCell>
                      {reporterId ? (
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {reporterId.length > 12
                              ? `${reporterId.slice(0, 8)}...${reporterId.slice(-4)}`
                              : reporterId}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => handleCopyId(reporterId)}
                            title="Copy full user ID"
                          >
                            {copiedId === reporterId ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">
                        {(report.reason || "").replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={STATUS_VARIANT[report.status] || "outline"}
                      >
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {report.createdAt
                        ? new Date(report.createdAt).toLocaleDateString()
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
                            onClick={() => onViewDetails(report)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
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

      {reports.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}–{Math.min(endIndex, reports.length)} of{" "}
            {reports.length} reports
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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