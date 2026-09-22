import { MoreHorizontal, Pencil, Trash2, Power, PowerOff } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import type { TrustRule } from "@/types/admin";

interface TrustRuleTableProps {
  rules: TrustRule[];
  onEdit: (rule: TrustRule) => void;
  onDelete: (ruleId: string) => void;
  onToggleActive: (ruleId: string, isActive: boolean) => void;
}

export const TrustRuleTable = ({
  rules,
  onEdit,
  onDelete,
  onToggleActive,
}: TrustRuleTableProps) => {
  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Rule Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No trust rules found. Create one to get started.
              </TableCell>
            </TableRow>
          ) : (
            rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell className="font-medium">{rule.ruleName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{rule.category}</Badge>
                </TableCell>
                <TableCell>
                  <span className={`font-semibold ${
                    rule.weightPoints > 0 ? 'text-green-500' : 'text-destructive'
                  }`}>
                    {rule.weightPoints > 0 ? `+${rule.weightPoints}` : rule.weightPoints}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={rule.isActive ? "default" : "secondary"}>
                    {rule.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm max-w-[250px] truncate">
                  {rule.description}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    } />
                    <DropdownMenuContent align="end" className="w-[180px]">
                      {/* Action: Edit Rule */}
                      <DropdownMenuItem onClick={() => onEdit(rule)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Rule
                      </DropdownMenuItem>

                      {/* Action: Toggle Active Status */}
                      <DropdownMenuItem onClick={() => onToggleActive(rule.id, rule.isActive)}>
                        {rule.isActive ? (
                          <>
                            <PowerOff className="mr-2 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Power className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {/* Action: Delete Rule */}
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDelete(rule.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Rule
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