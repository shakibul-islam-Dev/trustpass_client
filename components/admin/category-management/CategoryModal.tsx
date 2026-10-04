"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCategory, ICreateCategoryPayload, updateCategory } from "@/lib/admin_action/categories_action";
import Image from "next/image";
import { ICategoryResponse } from "@/lib/admin_api/getcategories";
import { isValidUrl } from "@/lib/utils";


interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: ICategoryResponse | null; // null = Add mode
  onSuccess: () => void;                // Reload callback
}

export const CategoryModal = ({
  isOpen,
  onClose,
  category,
  onSuccess,
}: CategoryModalProps) => {
  const isEditMode = !!category;

  // Form state
  const [name, setName] = useState(category?.name ?? "");
  const [iconUrl, setIconUrl] = useState(category?.iconUrl ?? "");
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handles form submission.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: ICreateCategoryPayload = {
        name: name.trim(),
        iconUrl: iconUrl.trim() || undefined,
        isActive,
      };

      let result;
      if (isEditMode && category) {
        // Edit
        result = await updateCategory(category.id, payload);
      } else {
        // Create
        result = await createCategory(payload);
      }

      // Handle error
      if (result?.error || result?.success === false) {
        toast.error(
          isEditMode
            ? "Failed to update category."
            : "Failed to create category."
        );
        return;
      }

      toast.success(
        isEditMode
          ? "Category updated successfully!"
          : "Category created successfully!"
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Category submit error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Category" : "Add New Category"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the category details below."
              : "Create a new category for businesses and products."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Category Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Electronics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground text-right">
              {name.length}/50
            </p>
          </div>

          {/* Icon URL */}
<div className="space-y-2">
  <Label htmlFor="iconUrl">
    Icon URL{" "}
    <span className="text-muted-foreground text-xs">(Optional)</span>
  </Label>
  <Input
    id="iconUrl"
    type="url"
    placeholder="https://example.com/icon.png"
    value={iconUrl}
    onChange={(e) => setIconUrl(e.target.value)}
  />
  {/* Preview only if URL is valid */}
  {isValidUrl(iconUrl) && (
    <div className="flex items-center gap-2 mt-2">
      <img
        src={iconUrl}
        alt="Icon preview"
        className="h-10 w-10 rounded border object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <span className="text-xs text-muted-foreground">Preview</span>
    </div>
  )}
</div>
          {/* Active Status */}
          <div className="space-y-2">
            <Label htmlFor="isActive">Status</Label>
            <Select
              value={isActive ? "active" : "inactive"}
              onValueChange={(value) => setIsActive(value === "active")}
            >
              <SelectTrigger id="isActive">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditMode
                ? "Update Category"
                : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};