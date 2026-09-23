"use client";

import { useState, useMemo } from "react";
import type { CustomerReport } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Search, Flag } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportTable } from "@/components/admin/reports-review/ReportTable";
import { ReportDetailsModal } from "@/components/admin/reports-review/ReportDetailsModal";

// Dummy Data (6 reports)
const DUMMY_REPORTS: CustomerReport[] = [
  {
    id: "r1",
    businessName: "Tech Solutions Ltd.",
    customerName: "Aritro Das",
    category: "FRAUD",
    description: "The business took advance payment but never delivered the service. They are not responding to calls or emails.",
    evidenceUrl: "#",
    status: "PENDING",
    createdAt: "2026-07-10",
    priority: "HIGH",
  },
  {
    id: "r2",
    businessName: "Green Grocery",
    customerName: "Shakibul Islam",
    category: "NON_DELIVERY",
    description: "Ordered products 2 weeks ago, but they haven't delivered yet. No response from customer support.",
    status: "PENDING",
    createdAt: "2026-07-11",
    priority: "MEDIUM",
  },
  {
    id: "r3",
    businessName: "Fashion Hub",
    customerName: "Saheen Akter",
    category: "MISLEADING",
    description: "The product description was completely different from what was delivered. The quality is very poor.",
    evidenceUrl: "#",
    status: "PENDING",
    createdAt: "2026-07-12",
    priority: "LOW",
  },
  {
    id: "r4",
    businessName: "Digital Marketing Agency",
    customerName: "Shajida Akter",
    category: "OTHER",
    description: "They charged extra hidden fees that were not mentioned in the initial agreement.",
    status: "RESOLVED",
    createdAt: "2026-07-13",
    priority: "MEDIUM",
  },
  {
    id: "r5",
    businessName: "Rahim Electronics",
    customerName: "Rahim Uddin",
    category: "FRAUD",
    description: "Sold me a fake product. The serial number doesn't match the official website.",
    evidenceUrl: "#",
    status: "PENDING",
    createdAt: "2026-07-14",
    priority: "HIGH",
  },
  {
    id: "r6",
    businessName: "Karim Foods",
    customerName: "Karim Mia",
    category: "NON_DELIVERY",
    description: "Food was never delivered, but money was deducted from my account. Restaurant is unresponsive.",
    status: "REJECTED",
    createdAt: "2026-07-15",
    priority: "LOW",
  },
];

export default function ModeratorReportsReview() {
  const [reports, setReports] = useState<CustomerReport[]>(DUMMY_REPORTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CustomerReport | null>(null);

  const handleResolve = (reportId: string) => {
    setReports(prev =>
      prev.map(r => r.id === reportId ? { ...r, status: "RESOLVED" as const } : r)
    );
  };

  const handleReject = (reportId: string) => {
    setReports(prev =>
      prev.map(r => r.id === reportId ? { ...r, status: "REJECTED" as const } : r)
    );
  };

  const openDetailsModal = (report: CustomerReport) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        report.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || report.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || report.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [reports, searchTerm, statusFilter, priorityFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 mb-1.5">
          <Flag className="h-3 w-3" /> Moderator Resolution
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Reports & Disputes</h1>
        <p className="text-muted-foreground mt-1">
          Review customer allegations, investigate evidence, and resolve or dismiss dispute claims.
        </p>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports by business, customer or details..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value ?? "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="HIGH">High Priority</SelectItem>
            <SelectItem value="MEDIUM">Medium Priority</SelectItem>
            <SelectItem value="LOW">Low Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reusable Report Table */}
      <ReportTable
        reports={filteredReports}
        onViewDetails={openDetailsModal}
        onResolve={handleResolve}
        onReject={handleReject}
      />

      {/* Reusable Details Modal */}
      <ReportDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        report={selectedReport}
        onResolve={handleResolve}
        onReject={handleReject}
      />
    </div>
  );
}
