"use client";

import { useState, useEffect } from "react";
import { UserManagementClient } from "@/components/admin/user-management/UserManagementClient";
import { fetchUsers } from "@/lib/admin_api/get-users";

/**
 * Previous implementation by: Existing Developer
 * Kept for reference — was a Server Component that could not forward cookies.
 *
 * export const dynamic = "force-dynamic";
 * export default async function UserManagementPage() {
 *   const users = await fetchUsers();
 *   // ...
 * }
 *
 * Updated by: Aritro
 * Reason: Client Component so the browser sends cookies automatically
 * via credentials: "include".
 */
export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchUsers({ page: 1, limit: 100 });
      setUsers(data);
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          User Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage users, change roles, and control access.
        </p>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading users...</div>
      ) : (
        <UserManagementClient initialUsers={users} />
      )}
    </div>
  );
}