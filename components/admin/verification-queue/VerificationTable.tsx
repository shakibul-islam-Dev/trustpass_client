import { MoreHorizontal, Eye, CheckCircle, XCircle } from "lucide-react";
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
import type { VerificationRequest } from "@/types/admin";

interface VerificationTableProps {
  requests: VerificationRequest[];
  onViewDetails: (request: VerificationRequest) => void;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

export const VerificationTable = ({
  requests,
  onViewDetails,
  onApprove,
  onReject,
}: VerificationTableProps) => {
  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Business</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Trust Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No verification requests found.
              </TableCell>
            </TableRow>
          ) : (
            requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{req.businessName}</span>
                    <span className="text-xs text-muted-foreground">{req.tradeLicenseNo}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{req.ownerName}</span>
                    <span className="text-xs text-muted-foreground">{req.ownerEmail}</span>
                  </div>
                </TableCell>
                <TableCell>{req.category}</TableCell>
                <TableCell>
                  <Badge variant={
                    req.trustScore >= 80 ? "default" :
                    req.trustScore >= 50 ? "secondary" :
                    "destructive"
                  }>
                    {req.trustScore}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    req.status === 'VERIFIED' ? "default" :
                    req.status === 'REJECTED' ? "destructive" :
                    "secondary"
                  }>
                    {req.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{req.submittedAt}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    } />
                    <DropdownMenuContent align="end" className="w-[180px]">
                      {/* Action: View Details (Documents Modal) */}
                      <DropdownMenuItem onClick={() => onViewDetails(req)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Documents
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {/* Action: Approve Verification */}
                      <DropdownMenuItem
                        onClick={() => onApprove(req.id)}
                        disabled={req.status === 'VERIFIED'}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </DropdownMenuItem>

                      {/* Action: Reject Verification */}
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onReject(req.id)}
                        disabled={req.status === 'REJECTED'}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
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