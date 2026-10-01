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
import { AlertTriangle } from "lucide-react";
import { deleteCategory } from "@/lib/admin_action/categories_action";
import { ICategoryResponse } from "@/lib/admin_api/getcategories";


interface DeleteCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: ICategoryResponse| null;
  onSuccess: () => void;
}

export const DeleteCategoryDialog = ({
  isOpen,
  onClose,
  category,
  onSuccess,
}: DeleteCategoryDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!category) return null;

  /**
   * Handles delete confirmation.
   */
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteCategory(category.id);

      if (result?.error || result?.success === false) {
        toast.error("Failed to delete category.");
        return;
      }

      toast.success("Category deleted successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Category
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <strong>{category.name}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};