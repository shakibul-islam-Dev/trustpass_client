"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  updateUserRole,
  deleteUser,
  toggleUserStatus,
} from "@/lib/admin_action/users_action";
import { fetchUsers } from "@/lib/admin_api/get-users";
import type { User, UserRole } from "@/types/admin";
import { UserFilters } from "./UserFilters";
import { UserTable } from "./UserTable";
import { RoleChangeModal } from "./RoleChangeModal";
import { DeleteUserDialog } from "./DeleteUserDialog";

interface UserManagementClientProps {
  initialUsers: any[];
}

export const UserManagementClient = ({
  initialUsers,
}: UserManagementClientProps) => {
  const mappedUsers: User[] = initialUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as UserRole,
    status: u.status, // 🆕 status field
    createdAt: new Date(u.createdAt).toLocaleDateString(),
    avatar: u.image,
  }));

  const [users, setUsers] = useState<User[]>(mappedUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 🆕 Status toggle loading state
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  const reloadUsers = async () => {
    try {
      const data = await fetchUsers({ page: 1, limit: 100 });
      const remapped: User[] = data.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role as UserRole,
        status: u.status,
        createdAt: new Date(u.createdAt).toLocaleDateString(),
        avatar: u.image,
      }));
      setUsers(remapped);
    } catch (error) {
      console.error("Failed to reload users:", error);
      toast.error("Failed to reload users.");
    }
  };

  // ── Role change ──
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const result = await updateUserRole(userId, newRole);

      if (result?.error || result?.success === false) {
        toast.error("Failed to update user role.");
        return;
      }

      toast.success("User role updated successfully!");
      setIsModalOpen(false);
      setSelectedUser(null);
      await reloadUsers();
    } catch (error) {
      console.error("Role change error:", error);
      toast.error("Something went wrong.");
    }
  };

  // ── 🆕 Status toggle ──
  const handleStatusToggle = async (user: User) => {
    setTogglingUserId(user.id);
    try {
      const result = await toggleUserStatus(user.id, user.status);

      if (result?.error || result?.success === false) {
        toast.error(result?.message || "Failed to update status.");
        return;
      }

      const isBlocked = String(user.status).toUpperCase() === "BLOCKED";
      const newStatus = isBlocked ? "ACTIVE" : "BLOCKED";

      toast.success(
        newStatus === "ACTIVE" ? "User unblocked!" : "User blocked!"
      );

      // Optimistic update
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, status: newStatus } : u
        )
      );
    } catch (error) {
      console.error("Status toggle error:", error);
      toast.error("Something went wrong.");
    } finally {
      setTogglingUserId(null);
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  // ── Delete ──
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    setIsDeleting(true);
    try {
      const result = await deleteUser(deletingUser.id);
      console.log("📥 Delete user result:", result);

      if (result?.error || result?.success === false) {
        toast.error("Failed to delete user.");
        return;
      }

      toast.success("User deleted successfully!");
      setIsDeleteDialogOpen(false);
      setDeletingUser(null);
      await reloadUsers();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Filter ──
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  return (
    <>
      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
      />

      <UserTable
        users={filteredUsers}
        onRoleChangeClick={openRoleModal}
        onDeleteClick={openDeleteDialog}
        onStatusToggle={handleStatusToggle}
      />

      <RoleChangeModal
        key={selectedUser?.id ?? "new"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onRoleChange={handleRoleChange}
      />

      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingUser(null);
        }}
        onConfirm={handleConfirmDelete}
        userName={deletingUser?.name}
        isLoading={isDeleting}
      />
    </>
  );
};