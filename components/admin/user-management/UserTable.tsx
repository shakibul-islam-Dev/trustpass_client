"use client";

import { MoreHorizontal, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { User, UserRole } from "@/types/admin";

interface UserTableProps {
  users: User[];
  onRoleChangeClick: (user: User) => void;
}

// Display-friendly role labels
const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: "Admin",
  MODERATOR: "Moderator",
  SELLER: "Seller",
  CUSTOMER: "Customer",
};

const ROLE_COLOR: Record<UserRole, string> = {
  ADMIN: "bg-primary/20 text-primary",
  MODERATOR: "bg-purple-500/20 text-purple-500",
  SELLER: "bg-blue-500/20 text-blue-500",
  CUSTOMER: "bg-muted text-muted-foreground",
};

export const UserTable = ({
  users,
  onRoleChangeClick,
}: UserTableProps) => {
  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ROLE_COLOR[user.role] || "bg-muted text-muted-foreground"
                    }`}
                  >
                    {ROLE_LABEL[user.role] || user.role}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.createdAt}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem onClick={() => onRoleChangeClick(user)}>
                        <Shield className="mr-2 h-4 w-4" />
                        Change Role
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};