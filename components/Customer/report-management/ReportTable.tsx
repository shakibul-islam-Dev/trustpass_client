import { MoreHorizontal, Eye, } from "lucide-react";
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
import type { CustomerReport } from "@/types/customer";

interface ReportTableProps {
  reports: CustomerReport[];
  onViewDetails: (report: CustomerReport) => void;
}

export const ReportTable = ({ reports, onViewDetails }: ReportTableProps) => {
  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Business</TableHead>
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
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                You haven't submitted any reports yet.
              </TableCell>
            </TableRow>
          ) : (
            reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.businessName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{report.category.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    report.priority === 'HIGH' ? "destructive" :
                    report.priority === 'MEDIUM' ? "secondary" :
                    "outline"
                  }>
                    {report.priority}
                  </Badge>
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
                    <DropdownMenuContent align="end" className="w-[160px]">
                      {/* Action: View Report Details */}
                      <DropdownMenuItem onClick={() => onViewDetails(report)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
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