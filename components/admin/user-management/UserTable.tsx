"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Shield,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { toast } from "sonner";
import type { User, UserRole } from "@/types/admin";

interface UserTableProps {
  users: User[];
  onRoleChangeClick: (user: User) => void;
  onDeleteClick: (user: User) => void;
}

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

const PAGE_SIZE = 20;

export const UserTable = ({
  users,
  onRoleChangeClick,
  onDeleteClick,
}: UserTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedUsers = users.slice(startIndex, endIndex);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  /**
   * Copies the user ID to the clipboard.
   * Shows a brief check-mark icon + toast.
   */
  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      toast.success("User ID copied!");
      setTimeout(() => setCopiedId(null), 1500);
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Failed to copy ID.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[60px]">#</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className="text-muted-foreground text-sm">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>

                  {/* User ID with copy button */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {user.id.length > 12
                          ? `${user.id.slice(0, 8)}...${user.id.slice(-4)}`
                          : user.id}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => handleCopyId(user.id)}
                        title="Copy full user ID"
                      >
                        {copiedId === user.id ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ROLE_COLOR[user.role] ||
                        "bg-muted text-muted-foreground"
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem
                          onClick={() => onRoleChangeClick(user)}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Change Role
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDeleteClick(user)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
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

      {/* Pagination */}
      {users.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}–{Math.min(endIndex, users.length)} of{" "}
            {users.length} users
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};