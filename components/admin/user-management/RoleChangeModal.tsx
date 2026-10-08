"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User, UserRole } from "@/types/admin";

interface RoleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onRoleChange: (userId: string, newRole: UserRole) => void;
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "CUSTOMER", label: "Customer" },
  { value: "SELLER", label: "Seller" },
  { value: "MODERATOR", label: "Moderator" },
  { value: "ADMIN", label: "Admin" },
];

export const RoleChangeModal = ({
  isOpen,
  onClose,
  user,
  onRoleChange,
}: RoleChangeModalProps) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>("CUSTOMER");

  useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role);
    }
  }, [user]);

  if (!user) return null;

  const handleSave = () => {
    onRoleChange(user.id, selectedRole);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Role for {user.name}</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Select New Role
          </label>
          <Select
            value={selectedRole}
            onValueChange={(value) =>
              setSelectedRole((value ?? "CUSTOMER") as UserRole)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select new role" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};