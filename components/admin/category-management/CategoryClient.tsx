"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { CategoryTable } from "./CategoryTable";
import { CategoryModal } from "./CategoryModal";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";
import { updateCategory } from "@/lib/admin_action/categories_action";
import { fetchCategories, ICategoryResponse } from "@/lib/admin_api/getcategories";


interface CategoryClientProps {
  initialCategories: ICategoryResponse[];
}

export const CategoryClient = ({ initialCategories }: CategoryClientProps) => {
  // --- States ---
  const [categories, setCategories] = useState(initialCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<ICategoryResponse | null>(null);

  /**
   * Reloads categories from server.
   * Called after successful add/edit/delete/toggle.
   */
  const reloadCategories = async () => {
    try {
      const data = await fetchCategories({ page: 1, limit: 100 });
      setCategories(data);
    } catch (error) {
      console.error("Failed to reload categories:", error);
      toast.error("Failed to reload categories.");
    }
  };

  // --- Handlers ---

  const handleEdit = (category: ICategoryResponse) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleDelete = (category: ICategoryResponse) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleActive = async (category: ICategoryResponse) => {
    const result = await updateCategory(category.id, {
      isActive: !category.isActive,
    });

    if (result?.error || result?.success === false) {
      toast.error("Failed to update status.");
      return;
    }

    toast.success(
      category.isActive ? "Category deactivated" : "Category activated"
    );
    await reloadCategories();
  };

  // --- Filtering ---
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch = cat.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && cat.isActive) ||
        (statusFilter === "inactive" && !cat.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchTerm, statusFilter]);

  return (
    <>
      {/* Top Bar: Search + Filters + Add Button */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Table */}
      <CategoryTable
        categories={filteredCategories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      {/* Add Modal */}
      <CategoryModal
        key="add"
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        category={null}
        onSuccess={reloadCategories}
      />

      {/* Edit Modal */}
      <CategoryModal
        key={selectedCategory?.id ?? "edit"}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        category={selectedCategory}
        onSuccess={reloadCategories}
      />

      {/* Delete Dialog */}
      <DeleteCategoryDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        category={selectedCategory}
        onSuccess={reloadCategories}
      />
    </>
  );
};