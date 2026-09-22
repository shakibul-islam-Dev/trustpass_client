import { MoreHorizontal, Eye, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
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
import type { CustomerReport } from "@/types/admin";

interface ReportTableProps {
  reports: CustomerReport[];
  onViewDetails: (report: CustomerReport) => void;
  onResolve: (reportId: string) => void;
  onReject: (reportId: string) => void;
}

export const ReportTable = ({
  reports,
  onViewDetails,
  onResolve,
  onReject,
}: ReportTableProps) => {
  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Business</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No reports found.
              </TableCell>
            </TableRow>
          ) : (
            reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.businessName}</TableCell>
                <TableCell>{report.customerName}</TableCell>
                <TableCell>
                  <Badge variant={
                    report.category === 'FRAUD' ? "destructive" :
                    report.category === 'MISLEADING' ? "secondary" :
                    report.category === 'NON_DELIVERY' ? "default" :
                    "outline"
                  }>
                    {report.category.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {report.priority === 'HIGH' && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    {report.priority === 'MEDIUM' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    {report.priority === 'LOW' && <AlertTriangle className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-xs">{report.priority}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    report.status === 'RESOLVED' ? "default" :
                    report.status === 'REJECTED' ? "destructive" :
                    "secondary"
                  }>
                    {report.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{report.createdAt}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    } />
                    <DropdownMenuContent align="end" className="w-[180px]">
                      {/* Action: View Report Details */}
                      <DropdownMenuItem onClick={() => onViewDetails(report)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {/* Action: Mark as Resolved */}
                      <DropdownMenuItem
                        onClick={() => onResolve(report.id)}
                        disabled={report.status === 'RESOLVED'}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark Resolved
                      </DropdownMenuItem>

                      {/* Action: Reject Report */}
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onReject(report.id)}
                        disabled={report.status === 'REJECTED'}
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