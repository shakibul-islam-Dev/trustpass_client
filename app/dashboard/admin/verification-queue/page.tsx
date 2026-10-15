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

const AdminVerificationQueue = () => {
  const [requests, setRequests] = useState<IVerificationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<IVerificationResponse | null>(null);

  const loadVerifications = async () => {
    setIsLoading(true);
    try {
      const data = await fetchVerifications({ limit: 100 });
      setRequests(data);
    } catch (error) {
      console.error("Failed to load verifications:", error);
      toast.error("Failed to load verifications.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVerifications();
  }, []);

  const handleApprove = async (requestId: string) => {
    try {
      const result = await reviewVerification(requestId, {
        status: "APPROVED",
      });

      if (result?.error || result?.success === false) {
        toast.error("Failed to approve.");
        return;
      }

      toast.success("Verification approved!");
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: "APPROVED" as const } : r
        )
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error("Approve error:", error);
      toast.error("Something went wrong.");
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const result = await reviewVerification(requestId, {
        status: "REJECTED",
      });

      if (result?.error || result?.success === false) {
        toast.error("Failed to reject.");
        return;
      }

      toast.success("Verification rejected.");
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: "REJECTED" as const } : r
        )
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error("Reject error:", error);
      toast.error("Something went wrong.");
    }
  };

  const openDetailsModal = (request: IVerificationResponse) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        (req.businessName || "").toLowerCase().includes(q) ||
        (req.businessSlug || "").toLowerCase().includes(q) ||
        (req.ownerId || "").toLowerCase().includes(q) ||
        (req.businessId || "").toLowerCase().includes(q) ||
        String(req.status || "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" || req.status === statusFilter;

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
            placeholder="Search by business, slug, or ID..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v ?? "all")}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
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
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      ) : (
        <VerificationTable
          requests={filteredRequests}
          onViewDetails={openDetailsModal}
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
};

export default AdminVerificationQueue;