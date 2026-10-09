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

import {
  fetchAllBusinesses,
  type IBusinessResponse,
} from "@/lib/admin_api/get-businesses";
import { deleteBusiness } from "@/lib/admin_action/businesses_action";
import type { Business } from "@/types/admin";
import { DeleteBusinessDialog } from "@/components/admin/bussiness-list/DeleteBusinessDialog";

const toBusiness = (raw: IBusinessResponse): Business => ({
  id: raw.id,
  name: raw.name,
  slug: raw.slug || "",
  ownerName: raw.ownerName || "-",
  ownerEmail: raw.ownerEmail || "-",
  category: raw.category || "-",
  phone: raw.phone || "-",
  location: raw.location || "-",
  verificationStatus: raw.verificationStatus as any,
  trustScore: raw.trustScore,
  productsCount: raw.productsCount,
  tradeLicenseNo: raw.tradeLicenseNo || "-",
  isFeatured: raw.isFeatured,
  createdAt: raw.createdAt,
});

const BusinessesPage = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  );

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingBusiness, setDeletingBusiness] = useState<Business | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const loadBusinesses = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllBusinesses({ page: 1, limit: 100 });
      setBusinesses(data.map(toBusiness));
    } catch (error) {
      console.error("Failed to load businesses:", error);
      toast.error("Failed to load businesses.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  const openDeleteDialog = (business: Business) => {
    setDeletingBusiness(business);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingBusiness) return;

    setIsDeleting(true);
    try {
      const result = await deleteBusiness(deletingBusiness.id);
      if (result?.error) {
        toast.error("Failed to delete business.");
        return;
      }

      toast.success("Business deleted successfully!");
      setIsDeleteOpen(false);
      setDeletingBusiness(null);
      await loadBusinesses();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong.");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDetailsModal = (business: Business) => {
    setSelectedBusiness(business);
    setIsModalOpen(true);
  };

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((business) => {
      const matchesSearch =
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.tradeLicenseNo
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        business.verificationStatus === statusFilter;

      const matchesCategory =
        categoryFilter === "all" || business.category === categoryFilter;

      const matchesFeatured =
        featuredFilter === "all" ||
        (featuredFilter === "featured" && business.isFeatured) ||
        (featuredFilter === "not-featured" && !business.isFeatured);

      return (
        matchesSearch && matchesStatus && matchesCategory && matchesFeatured
      );
    });
  }, [businesses, searchTerm, statusFilter, categoryFilter, featuredFilter]);

  const categories = useMemo(() => {
    return Array.from(new Set(businesses.map((b) => b.category))).filter(
      (c) => c && c !== "-"
    );
  }, [businesses]);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Businesses</h1>
        <p className="text-muted-foreground mt-1">
          Browse and manage all registered businesses.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, owner or license..."
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
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={categoryFilter}
          onValueChange={(value) => setCategoryFilter(value ?? "all")}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
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

      <BusinessDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        business={selectedBusiness}
      />

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