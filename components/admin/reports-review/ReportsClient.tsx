"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateReportStatus } from "@/lib/admin_action/reports_action";
import type {
  IReportResponse,
  TReportStatus,
} from "@/lib/admin_api/get-reports";
import { ReportDetailsModal } from "./ReportDetailsModal";
import { ReportTable } from "./ReportTable";


interface ReportsClientProps {
  initialReports: IReportResponse[];
}

export const ReportsClient = ({ initialReports }: ReportsClientProps) => {
  const [reports, setReports] = useState<IReportResponse[]>(initialReports);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] =
    useState<IReportResponse | null>(null);

  const openDetailsModal = (report: IReportResponse) => {
    setSelectedReport(report);
    setIsDetailsModalOpen(true);
  };

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
    <>
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

      <ReportTable
        reports={filteredReports}
        onViewDetails={openDetailsModal}
      />

      <ReportDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        report={selectedReport}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
};