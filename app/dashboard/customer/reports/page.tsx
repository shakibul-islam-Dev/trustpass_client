"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import type { CustomerReport, ReportSubmissionData } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CustomerReportTable } from "@/components/customer/report-management/CustomerReportTable";
import { CustomerReportFilters } from "@/components/customer/report-management/CustomerReportFilters";
import { CustomerReportStats } from "@/components/customer/report-management/CustomerReportStats";
import { CustomerReportDetailsModal } from "@/components/customer/report-management/CustomerReportDetailsModal";
import {
  fetchMyReports,
  type IReportResponse,
} from "@/lib/customer_api/my_reports";

const MyReportsPage = () => {
  // --- States ---
  const [reports, setReports] = useState<CustomerReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal States
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CustomerReport | null>(
    null
  );

  // --- Handlers ---

  /**
   * Fetches reports from the backend API.
   * Used on initial mount and after submitting a new report.
   * TODO: Add pagination + filters as query params when ready.
   */
  const loadReports = async () => {
  setIsLoading(true);
  try {
    const data = await fetchMyReports("?page=1&limit=50");

    // Backend response is already normalized by fetchMyReports
    // (business.name → businessName, reporter.name → customerName)
    const mapped: CustomerReport[] = data.map((r) => ({
      id: r.id,
      businessId: r.businessId,
      businessName: r.businessName ?? "Unknown Business",
      customerId: r.customerId ?? "",
      customerName: r.customerName ?? "",
      reason: r.reason,
      title: r.title,
      description: r.description,
      evidenceUrls: r.evidenceUrls,
      status: r.status,
      adminNote: r.adminNote,
      priority: "MEDIUM",
      createdAt: r.createdAt,
    }));

    setReports(mapped);
  } catch (error) {
    console.error("Failed to load reports:", error);
    toast.error("Failed to load your reports. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  // Load on mount
  useEffect(() => {
    loadReports();
  }, []);

  /**
   * Handles submitting a new report (optimistic add).
   * After success, reloads the list from backend.
   * TODO: Replace with proper API call once backend response is confirmed.
   */
  // const handleSubmitReport = async (data: ReportSubmissionData) => {
  //   // Optimistic UI update (immediate feedback)
  //   const newReport: CustomerReport = {
  //     id: `temp_${Date.now()}`,
  //     businessId: data.businessId,
  //     businessName: data.businessName,
  //     customerId: "",
  //     customerName: "",
  //     reason: data.category,
  //     description: data.description,
  //     evidenceUrl: data.evidenceUrl,
  //     status: "PENDING",
  //     priority: "MEDIUM",
  //     createdAt: new Date().toISOString().split("T")[0],
  //   };

  //   setReports((prev) => [newReport, ...prev]);

  //   // Reload from backend to get real data
  //   await loadReports();
  // };

  /**
   * Opens the details modal for a specific report.
   */
  const openDetailsModal = (report: CustomerReport) => {
    setSelectedReport(report);
    setIsDetailsModalOpen(true);
  };

  // --- Filtering Logic ---
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        report.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || report.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reports, searchTerm, statusFilter]);

  // --- Stats ---
  const stats = useMemo(
    () => ({
      total: reports.length,
      pending: reports.filter((r) => r.status === "PENDING").length,
      resolved: reports.filter((r) => r.status === "RESOLVED").length,
      rejected: reports.filter((r) => r.status === "REJECTED").length,
    }),
    [reports]
  );

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Reports</h1>
          <p className="text-muted-foreground mt-1">
            Track the status of reports you've submitted.
          </p>
        </div>
        {/* <Button onClick={() => setIsSubmitModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Submit New Report
        </Button> */}
      </div>

      {/* Stats */}
      <CustomerReportStats
        total={stats.total}
        pending={stats.pending}
        resolved={stats.resolved}
        rejected={stats.rejected}
      />

      {/* Filters */}
      <CustomerReportFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-muted animate-pulse rounded-md"
            />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-12 border rounded-md bg-card">
          <p className="text-muted-foreground">
            {reports.length === 0
              ? "You haven't submitted any reports yet."
              : "No reports match your search."}
          </p>
        </div>
      ) : (
        <CustomerReportTable
          reports={filteredReports}
          onViewDetails={openDetailsModal}
        />
      )}


      {/* Report Details Modal */}
      <CustomerReportDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        report={selectedReport}
      />
    </div>
  );
};

export default MyReportsPage;