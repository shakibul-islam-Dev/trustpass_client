"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { updateUserRole, deleteUser } from "@/lib/admin_action/users_action";
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

  const reloadUsers = async () => {
    try {
      const data = await fetchUsers({ page: 1, limit: 100 });
      const remapped: User[] = data.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role as UserRole,
        createdAt: new Date(u.createdAt).toLocaleDateString(),
        avatar: u.image,
      }));
      setUsers(remapped);
    } catch (error) {
      console.error("Failed to reload users:", error);
      toast.error("Failed to reload users.");
    }
  };

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

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

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