"use client";

import { useState, useMemo } from "react";
import type { VerificationRequest } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Shield, RefreshCw } from "lucide-react";
import { VerificationTable } from "@/components/admin/verification-queue/VerificationTable";
import { VerificationDetailsModal } from "@/components/admin/verification-queue/VerificationDetailsModal";
import { ScoreBreakdownModal } from "@/components/moderator/ScoreBreakdownModal";

// Dummy Data
const DUMMY_REQUESTS: VerificationRequest[] = [
  {
    id: "v1",
    businessId: "b1",
    businessName: "Tech Solutions Ltd.",
    ownerName: "Aritro Das",
    ownerEmail: "aritro@tech.com",
    category: "IT Services",
    phone: "+8801700000001",
    location: "Dhaka",
    tradeLicenseNo: "TRAD-2024-001",
    trustScore: 85,
    status: "PENDING",
    submittedAt: "2026-07-10",
    documents: [
      { id: "d1", documentType: "TRADE_LICENSE", fileUrl: "#", uploadedAt: "2026-07-10" },
      { id: "d2", documentType: "NID", fileUrl: "#", uploadedAt: "2026-07-10" },
    ],
  },
  {
    id: "v2",
    businessId: "b2",
    businessName: "Green Grocery",
    ownerName: "Shakibul Islam",
    ownerEmail: "shakib@green.com",
    category: "Retail",
    phone: "+8801700000002",
    location: "Chittagong",
    tradeLicenseNo: "TRAD-2024-002",
    trustScore: 60,
    status: "PENDING",
    submittedAt: "2026-07-11",
    documents: [
      { id: "d3", documentType: "TRADE_LICENSE", fileUrl: "#", uploadedAt: "2026-07-11" },
    ],
  },
  {
    id: "v3",
    businessId: "b3",
    businessName: "Fashion Hub",
    ownerName: "Saheen Akter",
    ownerEmail: "saheen@fashion.com",
    category: "Fashion",
    phone: "+8801700000003",
    location: "Sylhet",
    tradeLicenseNo: "TRAD-2024-003",
    trustScore: 45,
    status: "PENDING",
    submittedAt: "2026-07-12",
    documents: [
      { id: "d4", documentType: "TIN", fileUrl: "#", uploadedAt: "2026-07-12" },
    ],
  },
  {
    id: "v4",
    businessId: "b4",
    businessName: "Digital Marketing Agency",
    ownerName: "Shajida Akter",
    ownerEmail: "shajida@dma.com",
    category: "Marketing",
    phone: "+8801700000004",
    location: "Dhaka",
    tradeLicenseNo: "TRAD-2024-004",
    trustScore: 90,
    status: "PENDING",
    submittedAt: "2026-07-13",
    documents: [
      { id: "d5", documentType: "TRADE_LICENSE", fileUrl: "#", uploadedAt: "2026-07-13" },
      { id: "d6", documentType: "NID", fileUrl: "#", uploadedAt: "2026-07-13" },
      { id: "d7", documentType: "TIN", fileUrl: "#", uploadedAt: "2026-07-13" },
    ],
  },
  {
    id: "v5",
    businessId: "b5",
    businessName: "Rahim Electronics",
    ownerName: "Rahim Uddin",
    ownerEmail: "rahim@electronics.com",
    category: "Electronics",
    phone: "+8801700000005",
    location: "Khulna",
    tradeLicenseNo: "TRAD-2024-005",
    trustScore: 30,
    status: "PENDING",
    submittedAt: "2026-07-14",
    documents: [
      { id: "d8", documentType: "TRADE_LICENSE", fileUrl: "#", uploadedAt: "2026-07-14" },
    ],
  },
  {
    id: "v6",
    businessId: "b6",
    businessName: "Karim Foods",
    ownerName: "Karim Mia",
    ownerEmail: "karim@foods.com",
    category: "Food",
    phone: "+8801700000006",
    location: "Rajshahi",
    tradeLicenseNo: "TRAD-2024-006",
    trustScore: 75,
    status: "PENDING",
    submittedAt: "2026-07-15",
    documents: [
      { id: "d9", documentType: "TRADE_LICENSE", fileUrl: "#", uploadedAt: "2026-07-15" },
      { id: "d10", documentType: "NID", fileUrl: "#", uploadedAt: "2026-07-15" },
    ],
  },
];

export default function ModeratorVerificationQueue() {
  const [requests, setRequests] = useState<VerificationRequest[]>(DUMMY_REQUESTS);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);

  // Score Breakdown Modal State
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [selectedForScore, setSelectedForScore] = useState<VerificationRequest | null>(null);

  const handleApprove = (requestId: string) => {
    setRequests(prev =>
      prev.map(req => req.id === requestId ? { ...req, status: "VERIFIED" as const } : req)
    );
  };

  const handleReject = (requestId: string) => {
    setRequests(prev =>
      prev.map(req => req.id === requestId ? { ...req, status: "REJECTED" as const } : req)
    );
  };

  const openDetailsModal = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const openScoreModal = (request: VerificationRequest) => {
    setSelectedForScore(request);
    setIsScoreModalOpen(true);
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((req) =>
      req.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.tradeLicenseNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [requests, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary mb-1.5">
            <Shield className="h-3 w-3" /> Moderator Queue
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Business Verification Queue</h1>
          <p className="text-muted-foreground mt-1">
            Audit submitted Trade Licenses, National IDs, and credentials to certify businesses.
          </p>
        </div>

        {/* Quick Trigger Score Breakdown Button */}
        <Button
          variant="outline"
          onClick={() => {
            const sample = requests[0];
            if (sample) openScoreModal(sample);
          }}
          className="gap-2 shrink-0 border-primary/40 hover:bg-primary/10"
        >
          <RefreshCw className="h-4 w-4 text-primary" />
          Score Breakdown & Recalculate
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by business, owner or license..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Reusable Verification Table */}
      <VerificationTable
        requests={filteredRequests}
        onViewDetails={openDetailsModal}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Details Modal */}
      <VerificationDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        request={selectedRequest}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Score Breakdown & Recalculate Modal */}
      <ScoreBreakdownModal
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
        businessName={selectedForScore?.businessName}
        initialScore={selectedForScore?.trustScore}
      />
    </div>
  );
}
