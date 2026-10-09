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
import { VerificationTable } from "@/components/admin/verification-queue/VerificationTable";
import { VerificationDetailsModal } from "@/components/admin/verification-queue/VerificationDetailsModal";
import {
  fetchVerifications,
  type IVerificationResponse,
} from "@/lib/admin_api/get-verifications";
import { reviewVerification } from "@/lib/admin_action/verifications_action";

/**
 * Previous implementation by: Saheen (deleted/outdated)
 * Re-implemented by: Aritro
 * Reason: Same type mismatch as Moderator Reports.
 * Reused Admin Verification Queue pattern.
 */
export default function ModeratorVerificationQueue() {
  const [requests, setRequests] = useState<IVerificationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<IVerificationResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchVerifications({ limit: 100 });
      setRequests(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleApprove = async (id: string) => {
    const result = await reviewVerification(id, { status: "APPROVED" });
    if (result?.error) {
      toast.error("Failed to approve.");
      return;
    }
    toast.success("Approved!");
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "APPROVED" as const } : r))
    );
    setIsModalOpen(false);
  };

  const handleReject = async (id: string) => {
    const result = await reviewVerification(id, { status: "REJECTED" });
    if (result?.error) {
      toast.error("Failed to reject.");
      return;
    }
    toast.success("Rejected.");
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "REJECTED" as const } : r))
    );
    setIsModalOpen(false);
  };

  const openDetails = (request: IVerificationResponse) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        (r.businessName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.ownerName || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Verification Queue</h1>
        <p className="text-muted-foreground mt-1">
          Review and verify business documents.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : (
        <VerificationTable
          requests={filtered}
          onViewDetails={openDetails}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      <VerificationDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        request={selectedRequest}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}