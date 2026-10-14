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
import { ProductTable } from "@/components/admin/products/ProductTable";
import { ProductDetailsModal } from "@/components/admin/products/ProductDetailsModal";
import { DeleteProductDialog } from "@/components/admin/products/DeleteProductDialog";
import {
  fetchAllProducts,
  type IProductResponse,
} from "@/lib/admin_api/get-products";
import { deleteProduct } from "@/lib/admin_action/products_action";

const ProductsPage = () => {
  const [products, setProducts] = useState<IProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<IProductResponse | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] =
    useState<IProductResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Load ──
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllProducts({ page: 1, limit: 100 });
      console.log("📦 Loaded products:", data.length);
      setProducts(data);
    } catch (error) {
      console.error("Load error:", error);
      toast.error("Failed to load products.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ── Modals ──
  const openDetailsModal = (product: IProductResponse) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const openDeleteDialog = (product: IProductResponse) => {
    setDeletingProduct(product);
    setIsDeleteOpen(true);
  };

  // ── Delete ──
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;

    setIsDeleting(true);
    try {
      const result = await deleteProduct(deletingProduct.id);
      console.log("🗑️ Delete result:", result);

      if (result?.error) {
        toast.error(result.message || "Failed to delete product.");
        return;
      }

      toast.success(`"${deletingProduct.name}" deleted successfully!`);
      setProducts((prev) =>
        prev.filter((p) => p.id !== deletingProduct.id)
      );
      setIsDeleteOpen(false);
      setDeletingProduct(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Filter ──
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        (p.name || "").toLowerCase().includes(q) ||
        (p.slug || "").toLowerCase().includes(q) ||
        (p.businessId || "").toLowerCase().includes(q) ||
        (p.id || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        String(p.status).toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [products, searchTerm, statusFilter]);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
        <p className="text-muted-foreground mt-1">
          Browse and manage all products on the platform.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, slug, business ID..."
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
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
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
        <ProductTable
          products={filteredProducts}
          onViewDetails={openDetailsModal}
          onDelete={openDeleteDialog}
        />
      )}

      {/* Details Modal */}
      <ProductDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onDelete={openDeleteDialog}
      />

      {/* Delete Dialog */}
      <DeleteProductDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingProduct(null);
        }}
        onConfirm={handleConfirmDelete}
        productName={deletingProduct?.name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProductsPage;