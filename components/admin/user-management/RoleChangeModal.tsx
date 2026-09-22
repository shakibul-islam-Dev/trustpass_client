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
import { User, UserRole } from "@/types/admin";


interface RoleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onRoleChange: (userId: string, newRole: UserRole) => void;
}

export const RoleChangeModal = ({
  isOpen,
  onClose,
  user,
  onRoleChange,
}: RoleChangeModalProps) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  if (!user) return null;

  const handleSave = () => {
    if (selectedRole && user.id) {
      onRoleChange(user.id, selectedRole as UserRole);
    }
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
            onValueChange={(value: string | null) => {
              if (value) setSelectedRole(value as UserRole);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select new role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Customer">Customer</SelectItem>
              <SelectItem value="Business Owner">Business Owner</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
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