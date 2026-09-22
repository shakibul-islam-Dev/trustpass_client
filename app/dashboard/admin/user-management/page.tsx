'use client'

import { RoleChangeModal } from "@/components/admin/user-management/RoleChangeModal";
import { UserFilters } from "@/components/admin/user-management/UserFilters";
import { UserTable } from "@/components/admin/user-management/UserTable";
import { User, UserRole } from "@/types/admin";
import { useMemo, useState } from "react";

// Types Definition
// export type UserRole = 'Customer' | 'Business Owner' | 'Admin';

// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: UserRole;
//   status: 'Active' | 'Banned' | 'Pending';
//   createdAt: string;
//   avatar?: string;
// }

// Dummy Data (6 users)
const DUMMY_USERS: User[] = [
  { id: "1", name: "Aritro", email: "aritro@example.com", role: "Admin", status: "Active", createdAt: "2026-01-15" },
  { id: "2", name: "Shakibul", email: "shakib@example.com", role: "Business Owner", status: "Active", createdAt: "2026-02-10" },
  { id: "3", name: "Saheen", email: "saheen@example.com", role: "Customer", status: "Active", createdAt: "2026-03-05" },
  { id: "4", name: "Shajida", email: "shajida@example.com", role: "Business Owner", status: "Banned", createdAt: "2026-04-20" },
  { id: "5", name: "Rahim", email: "rahim@example.com", role: "Customer", status: "Pending", createdAt: "2026-05-12" },
  { id: "6", name: "Karim", email: "karim@example.com", role: "Customer", status: "Active", createdAt: "2026-06-01" },
];

const UserManagement = () => {
  // --- States ---
  const [users, setUsers] = useState<User[]>(DUMMY_USERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // --- Handlers ---

  /**
   * Handles changing user role.
   * Fixed userId type from number to string
   */
  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    setIsModalOpen(false);
    setSelectedUser(null);
    console.log(`API Call: Change role for user ${userId} to ${newRole}`);
  };

  /**
   * Handles banning or unbanning a user.
   * Fixed userId type from number to string
   */
  const handleBanToggle = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "Banned" ? "Active" : "Banned";
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus as User['status'] } : u));
    console.log(`API Call: Change status for user ${userId} to ${newStatus}`);
  };

  /**
   * Opens the Role Change Modal for a specific user.
   */
  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // --- Filtering Logic ---
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage users, change roles, and control access.
        </p>
      </div>

      {/* Filters */}
      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Table */}
      <UserTable
        users={filteredUsers}
        onRoleChangeClick={openRoleModal}
        onBanToggle={handleBanToggle}
      />

      {/* Role Change Modal */}
      <RoleChangeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onRoleChange={handleRoleChange}
      />
    </div>
  );
};

export default UserManagement;