"use client";

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
  onEdit?: (rule: TrustRule) => void;
  onDelete?: (ruleId: string) => void;
  onToggleActive?: (ruleId: string, isActive: boolean) => void;
  readOnly?: boolean;
}

export const TrustRuleTable = ({
  rules,
  onEdit,
  onDelete,
  onToggleActive,
  readOnly = false,
}: TrustRuleTableProps) => {
  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Rule Key</TableHead>
            <TableHead>Label</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Active</TableHead>
            {!readOnly && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.length === 0 ? (
            <TableRow>
              <TableCell colSpan={readOnly ? 5 : 6} className="text-center py-8 text-muted-foreground">
                No trust rules found. Create one to get started.
              </TableCell>
            </TableRow>
          ) : (
            rules.map((rule) => (
              <TableRow key={rule.id}>
                {/* Rule Key */}
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {rule.ruleKey}
                </TableCell>

                {/* Label */}
                <TableCell className="font-medium">{rule.label}</TableCell>

                {/* Status */}
                <TableCell>
                  <Badge variant="outline">{rule.status}</Badge>
                </TableCell>

                {/* Points */}
                <TableCell>
                  <span className={`font-semibold ${
                    rule.points > 0 ? 'text-green-500' : 'text-destructive'
                  }`}>
                    {rule.points > 0 ? `+${rule.points}` : rule.points}
                  </span>
                </TableCell>

                {/* Is Active */}
                <TableCell>
                  <Badge variant={rule.isActive ? "default" : "secondary"}>
                    {rule.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>

                {/* Actions */}
                {!readOnly && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      } />
                      <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuItem onClick={() => onEdit?.(rule)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Rule
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => onToggleActive?.(rule.id, rule.isActive)}>
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

                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete?.(rule.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Rule
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};