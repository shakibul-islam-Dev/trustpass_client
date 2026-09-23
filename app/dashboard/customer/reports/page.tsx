"use client";

import { useState, useMemo } from "react";
import { ReportTable } from "@/components/customer/report-management/ReportTable";
import { ReportSubmissionModal } from "@/components/customer/report-management/ReportSubmissionModal";

import type { CustomerReport, ReportSubmissionData } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Clock, CheckCircle, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerReportDetailsModal } from "@/components/customer/report-management/CustomerReportDetailsModal";


// Dummy Data (6 reports)
const DUMMY_REPORTS: CustomerReport[] = [
  {
    id: "r1",
    businessId: "b1",
    businessName: "Tech Solutions Ltd.",
    customerId: "c1",
    customerName: "Aritro Das",
    category: "FRAUD",
    description: "The business took advance payment but never delivered the service.",
    evidenceUrl: "#",
    status: "PENDING",
    priority: "HIGH",
    createdAt: "2026-07-10",
  },
  {
    id: "r2",
    businessId: "b2",
    businessName: "Green Grocery",
    customerId: "c1",
    customerName: "Aritro Das",
    category: "NON_DELIVERY",
    description: "Ordered products 2 weeks ago, but they haven't delivered yet.",
    status: "PENDING",
    priority: "MEDIUM",
    createdAt: "2026-07-11",
  },
  {
    id: "r3",
    businessId: "b3",
    businessName: "Fashion Hub",
    customerId: "c1",
    customerName: "Aritro Das",
    category: "MISLEADING",
    description: "The product description was completely different from what was delivered.",
    evidenceUrl: "#",
    status: "RESOLVED",
    priority: "LOW",
    adminNote: "We have verified your complaint and issued a warning to the business.",
    createdAt: "2026-07-05",
  },
  {
    id: "r4",
    businessId: "b4",
    businessName: "Digital Marketing Agency",
    customerId: "c1",
    customerName: "Aritro Das",
    category: "OTHER",
    description: "They charged extra hidden fees that were not mentioned in the agreement.",
    status: "RESOLVED",
    priority: "MEDIUM",
    adminNote: "Hidden fees have been refunded to your account.",
    createdAt: "2026-06-28",
  },
  {
    id: "r5",
    businessId: "b5",
    businessName: "Rahim Electronics",
    customerId: "c1",
    customerName: "Aritro Das",
    category: "FRAUD",
    description: "Sold me a fake product. The serial number doesn't match.",
    evidenceUrl: "#",
    status: "REJECTED",
    priority: "HIGH",
    adminNote: "Insufficient evidence provided. Please provide more documentation.",
    createdAt: "2026-06-15",
  },
  {
    id: "r6",
    businessId: "b6",
    businessName: "Karim Foods",
    customerId: "c1",
    customerName: "Aritro Das",
    category: "NON_DELIVERY",
    description: "Paid for the order but the business canceled it without any refund.",
    status: "PENDING",
    priority: "LOW",
    createdAt: "2026-07-15",
  },
];

const MyReportsPage = () => {
  // --- States ---
  const [reports, setReports] = useState<CustomerReport[]>(DUMMY_REPORTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal States
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CustomerReport | null>(null);

  // --- Handlers (API calls will go here later) ---

  /**
   * Handles submitting a new report.
   * TODO: Replace with API Call (POST /reports)
   */
  const handleSubmitReport = (data: ReportSubmissionData) => {
    const newReport: CustomerReport = {
      id: `r_${Date.now()}`,
      businessId: data.businessId,
      businessName: data.businessName,
      customerId: "c1", // TODO: Get from auth context
      customerName: "Aritro Das", // TODO: Get from auth context
      category: data.category,
      description: data.description,
      evidenceUrl: data.evidenceUrl,
      status: "PENDING",
      priority: "MEDIUM", // Default priority
      createdAt: new Date().toISOString().split("T")[0],
    };

    setReports(prev => [newReport, ...prev]);
    console.log(`API Call: Submit new report`, newReport);
  };

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

      const matchesStatus = statusFilter === "all" || report.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reports, searchTerm, statusFilter]);

  // --- Stats ---
  const stats = useMemo(() => ({
    total: reports.length,
    pending: reports.filter(r => r.status === "PENDING").length,
    resolved: reports.filter(r => r.status === "RESOLVED").length,
    rejected: reports.filter(r => r.status === "REJECTED").length,
  }), [reports]);

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
        <Button onClick={() => setIsSubmitModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Submit New Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold">{stats.pending}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-3xl font-bold">{stats.resolved}</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by business or description..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <ReportTable
        reports={filteredReports}
        onViewDetails={openDetailsModal}
      />

      {/* Submit Report Modal */}
      <ReportSubmissionModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleSubmitReport}
      />

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