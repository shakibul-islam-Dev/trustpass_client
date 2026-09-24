"use client";

import { useState, useMemo } from "react";
import type { Business } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BusinessDetailsModal } from "@/components/admin/bussiness-list/BusinessDetailsModal";
import { BusinessTable } from "@/components/admin/bussiness-list/BusinessTable";

// Dummy Data (6 businesses)
const DUMMY_BUSINESSES: Business[] = [
  {
    id: "b1",
    name: "Tech Solutions Ltd.",
    slug: "tech-solutions",
    ownerName: "Aritro Das",
    ownerEmail: "aritro@tech.com",
    category: "IT Services",
    phone: "+8801700000001",
    location: "Dhaka",
    verificationStatus: "VERIFIED",
    trustScore: 85,
    productsCount: 12,
    tradeLicenseNo: "TRAD-2024-001",
    isFeatured: true,
    createdAt: "2026-01-15",
  },
  {
    id: "b2",
    name: "Green Grocery",
    slug: "green-grocery",
    ownerName: "Shakibul Islam",
    ownerEmail: "shakib@green.com",
    category: "Retail",
    phone: "+8801700000002",
    location: "Chittagong",
    verificationStatus: "PENDING",
    trustScore: 60,
    productsCount: 45,
    tradeLicenseNo: "TRAD-2024-002",
    isFeatured: false,
    createdAt: "2026-02-10",
  },
  {
    id: "b3",
    name: "Fashion Hub",
    slug: "fashion-hub",
    ownerName: "Saheen Akter",
    ownerEmail: "saheen@fashion.com",
    category: "Fashion",
    phone: "+8801700000003",
    location: "Sylhet",
    verificationStatus: "VERIFIED",
    trustScore: 75,
    productsCount: 28,
    tradeLicenseNo: "TRAD-2024-003",
    isFeatured: true,
    createdAt: "2026-03-05",
  },
  {
    id: "b4",
    name: "Digital Marketing Agency",
    slug: "digital-marketing",
    ownerName: "Shajida Akter",
    ownerEmail: "shajida@dma.com",
    category: "Marketing",
    phone: "+8801700000004",
    location: "Dhaka",
    verificationStatus: "VERIFIED",
    trustScore: 90,
    productsCount: 8,
    tradeLicenseNo: "TRAD-2024-004",
    isFeatured: false,
    createdAt: "2026-04-20",
  },
  {
    id: "b5",
    name: "Rahim Electronics",
    slug: "rahim-electronics",
    ownerName: "Rahim Uddin",
    ownerEmail: "rahim@electronics.com",
    category: "Electronics",
    phone: "+8801700000005",
    location: "Khulna",
    verificationStatus: "REJECTED",
    trustScore: 30,
    productsCount: 56,
    tradeLicenseNo: "TRAD-2024-005",
    isFeatured: false,
    createdAt: "2026-05-12",
  },
  {
    id: "b6",
    name: "Karim Foods",
    slug: "karim-foods",
    ownerName: "Karim Mia",
    ownerEmail: "karim@foods.com",
    category: "Food",
    phone: "+8801700000006",
    location: "Rajshahi",
    verificationStatus: "PENDING",
    trustScore: 65,
    productsCount: 32,
    tradeLicenseNo: "TRAD-2024-006",
    isFeatured: false,
    createdAt: "2026-06-01",
  },
];

const BusinessesPage = () => {
  // --- States ---
  const [businesses, setBusinesses] = useState<Business[]>(DUMMY_BUSINESSES);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  // --- Handlers (API calls will go here later) ---

  /**
   * Handles toggling featured status.
   * TODO: Replace with API Call (PATCH /admin/businesses/:id/featured)
   */
  const handleToggleFeatured = (businessId: string, currentStatus: boolean) => {
    setBusinesses(prev =>
      prev.map(b => b.id === businessId ? { ...b, isFeatured: !currentStatus } : b)
    );
    console.log(`API Call: Toggle featured for business ${businessId}`);
  };

  /**
   * Handles approving business verification.
   * TODO: Replace with API Call (PATCH /admin/businesses/:id/approve)
   */
  const handleApprove = (businessId: string) => {
    setBusinesses(prev =>
      prev.map(b => b.id === businessId ? { ...b, verificationStatus: "VERIFIED" as const } : b)
    );
    console.log(`API Call: Approve business ${businessId}`);
  };

  /**
   * Handles rejecting business verification.
   * TODO: Replace with API Call (PATCH /admin/businesses/:id/reject)
   */
  const handleReject = (businessId: string) => {
    setBusinesses(prev =>
      prev.map(b => b.id === businessId ? { ...b, verificationStatus: "REJECTED" as const } : b)
    );
    console.log(`API Call: Reject business ${businessId}`);
  };

  /**
   * Opens the details modal for a specific business.
   */
  const openDetailsModal = (business: Business) => {
    setSelectedBusiness(business);
    setIsModalOpen(true);
  };

  // --- Filtering Logic ---
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((business) => {
      const matchesSearch =
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.tradeLicenseNo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || business.verificationStatus === statusFilter;
      const matchesCategory = categoryFilter === "all" || business.category === categoryFilter;
      const matchesFeatured =
        featuredFilter === "all" ||
        (featuredFilter === "featured" && business.isFeatured) ||
        (featuredFilter === "not-featured" && !business.isFeatured);

      return matchesSearch && matchesStatus && matchesCategory && matchesFeatured;
    });
  }, [businesses, searchTerm, statusFilter, categoryFilter, featuredFilter]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    return Array.from(new Set(businesses.map(b => b.category)));
  }, [businesses]);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Businesses</h1>
        <p className="text-muted-foreground mt-1">
          Browse, verify, and manage all registered businesses.
        </p>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, owner or license..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="VERIFIED">Verified</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value ?? "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Featured Filter */}
        <Select value={featuredFilter} onValueChange={(value) => setFeaturedFilter(value ?? "all")}>
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
      <BusinessTable
        businesses={filteredBusinesses}
        onViewDetails={openDetailsModal}
        onToggleFeatured={handleToggleFeatured}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Details Modal */}
      <BusinessDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        business={selectedBusiness}
        onToggleFeatured={handleToggleFeatured}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default BusinessesPage;