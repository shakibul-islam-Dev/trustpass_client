import { MoreHorizontal, Shield, Ban, CheckCircle, Edit } from "lucide-react";
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
import { User, UserRole } from "@/types/admin";

// Define User Type (later replace with actual API type)
// export type UserRole = "Admin" | "Business Owner" | "Customer";



interface UserTableProps {
  users: User[];
  onRoleChangeClick: (user: User) => void;
  onBanToggle: (userId: string, currentStatus: string) => void;
}

export const UserTable = ({ users, onRoleChangeClick, onBanToggle }: UserTableProps) => {
  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'Admin' ? 'bg-primary/20 text-primary' :
                    user.role === 'Business Owner' ? 'bg-blue-500/20 text-blue-500' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`flex items-center gap-1 text-xs font-medium ${
                    user.status === 'Active' ? 'text-green-500' :
                    user.status === 'Banned' ? 'text-destructive' :
                    'text-yellow-500'
                  }`}>
                    {user.status}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.createdAt}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    } />
                    <DropdownMenuContent align="end" className="w-[160px]">
                      {/* Action: Open Role Change Modal */}
                      <DropdownMenuItem onClick={() => onRoleChangeClick(user)}>
                        <Shield className="mr-2 h-4 w-4" />
                        Change Role
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {/* Action: Toggle Ban Status */}
                      <DropdownMenuItem
                        variant={user.status === 'Banned' ? 'default' : 'destructive'}
                        onClick={() => onBanToggle(user.id, user.status)}
                      >
                        {user.status === 'Banned' ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Unban User
                          </>
                        ) : (
                          <>
                            <Ban className="mr-2 h-4 w-4" />
                            Ban User
                          </>
                        )}
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