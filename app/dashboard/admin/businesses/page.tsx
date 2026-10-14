"use client";

import { useState, useEffect, useMemo } from "react";
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
import { BusinessTable } from "@/components/admin/bussiness-list/BusinessTable";
import { BusinessDetailsModal } from "@/components/admin/bussiness-list/BusinessDetailsModal";
import { DeleteBusinessDialog } from "@/components/admin/bussiness-list/DeleteBusinessDialog";
import {
  fetchAllBusinesses,
  type IBusinessResponse,
} from "@/lib/admin_api/get-businesses";
import { deleteBusiness } from "@/lib/admin_action/businesses_action";

const BusinessesPage = () => {
  const [businesses, setBusinesses] = useState<IBusinessResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] =
    useState<IBusinessResponse | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingBusiness, setDeletingBusiness] =
    useState<IBusinessResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Load ──
  const loadBusinesses = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllBusinesses({ page: 1, limit: 100 });
      console.log("📦 Loaded businesses:", data.length);
      setBusinesses(data);
    } catch (error) {
      console.error("Load error:", error);
      toast.error("Failed to load businesses.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  // ── Open Modals ──
  const openDetailsModal = (business: IBusinessResponse) => {
    console.log("🔓 Open details:", business.name);
    setSelectedBusiness(business);
    setIsModalOpen(true);
  };

  const openDeleteDialog = (business: IBusinessResponse) => {
    console.log("🗑️ Open delete:", business.name);
    setDeletingBusiness(business);
    setIsDeleteOpen(true);
  };

  // ── Confirm Delete ──
  const handleConfirmDelete = async () => {
    if (!deletingBusiness) return;

    setIsDeleting(true);
    try {
      const result = await deleteBusiness(deletingBusiness.id);
      console.log("🗑️ Delete result:", result);

      if (result?.error) {
        toast.error(result.message || "Failed to delete business.");
        return;
      }

      toast.success(`"${deletingBusiness.name}" deleted successfully!`);

      // Optimistic update
      setBusinesses((prev) =>
        prev.filter((b) => b.id !== deletingBusiness.id)
      );

      setIsDeleteOpen(false);
      setDeletingBusiness(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Filter ──
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((business) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        (business.name || "").toLowerCase().includes(q) ||
        (business.ownerName || "").toLowerCase().includes(q) ||
        (business.ownerEmail || "").toLowerCase().includes(q) ||
        (business.contactPhone || "").toLowerCase().includes(q) ||
        (business.slug || "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        business.verificationStatus === statusFilter;

      const matchesFeatured =
        featuredFilter === "all" ||
        (featuredFilter === "featured" && business.isFeatured) ||
        (featuredFilter === "not-featured" && !business.isFeatured);

      return matchesSearch && matchesStatus && matchesFeatured;
    });
  }, [businesses, searchTerm, statusFilter, featuredFilter]);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Businesses</h1>
        <p className="text-muted-foreground mt-1">
          Browse and manage all registered businesses.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, owner, email or phone..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value ?? "all")}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="VERIFIED">Verified</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={featuredFilter}
          onValueChange={(value) => setFeaturedFilter(value ?? "all")}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Featured" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="not-featured">Not Featured</SelectItem>
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
        <BusinessTable
          businesses={filteredBusinesses}
          onViewDetails={openDetailsModal}
          onDelete={openDeleteDialog}
        />
      )}

      {/* Details Modal */}
      <BusinessDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        business={selectedBusiness}
      />

      {/* Delete Dialog */}
      <DeleteBusinessDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingBusiness(null);
        }}
        onConfirm={handleConfirmDelete}
        businessName={deletingBusiness?.name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default BusinessesPage;