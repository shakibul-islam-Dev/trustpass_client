"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { ReportTable } from "@/components/admin/reports-review/ReportTable";
import { ReportDetailsModal } from "@/components/admin/reports-review/ReportDetailsModal";
import {
  fetchReports,
  type IReportResponse,
  type TReportStatus,
} from "@/lib/admin_api/get-reports";
import { updateReportStatus } from "@/lib/admin_action/reports_action";

/**
 * Moderator Reports page.
 *
 * Reuses the Admin report-management components
 * (`components/admin/reports-review/*`) because both roles hit the same
 * endpoints (GET /api/v1/reports, PATCH /api/v1/reports/:id/status).
 * See Role Access Matrix — "Verify documents/reports": MODERATOR, ADMIN.
 *
 * Implemented by: Aritro
 */
export default function ModeratorReportsPage() {
  const [reports, setReports] = useState<IReportResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] =
    useState<IReportResponse | null>(null);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await fetchReports({ page: 1, limit: 100 });
      setReports(data);
    } catch (error) {
      console.error("Failed to load reports:", error);
      toast.error("Failed to load reports.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleStatusUpdate = async (
    reportId: string,
    status: TReportStatus
  ) => {
    try {
      const result = await updateReportStatus(reportId, { status });

      if (result?.error || result?.success === false) {
        toast.error("Failed to update report status.");
        return;
      }

      toast.success("Report status updated!");
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status } : r))
      );
      setIsDetailsModalOpen(false);
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Something went wrong.");
    }
  };

  const openDetailsModal = (report: IReportResponse) => {
    setSelectedReport(report);
    setIsDetailsModalOpen(true);
  };

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        (report.businessName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (report.customerName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || report.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reports, searchTerm, statusFilter]);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports Review</h1>
        <p className="text-muted-foreground mt-1">
          Review customer reports and take action.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by business or customer..."
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
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="REVIEWED">Reviewed</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      ) : (
        <ReportTable
          reports={filteredReports}
          onViewDetails={openDetailsModal}
        />
      )}

      {/* Details Modal */}
      <ReportDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        report={selectedReport}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}