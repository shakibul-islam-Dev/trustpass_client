
import { UserManagementClient } from "@/components/admin/user-management/UserManagementClient";
import { fetchUsers } from "@/lib/admin_api/get-users";

export const dynamic = "force-dynamic";

export default async function UserManagementPage() {
  console.log("🎯 Server: Fetching users...");
  const users = await fetchUsers({ page: 1, limit: 100 });
  console.log("🎯 Server: Users fetched:", users.length, "users");
  console.log("🎯 Server: First user:", users[0]);

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

      <UserManagementClient initialUsers={users} />
    </div>
  );
}