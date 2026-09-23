import { MoreHorizontal, Eye, CheckCircle, XCircle, Star, StarOff } from "lucide-react";
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
import type { Business } from "@/types/admin";

interface BusinessTableProps {
  businesses: Business[];
  onViewDetails: (business: Business) => void;
  onToggleFeatured: (businessId: string, isFeatured: boolean) => void;
  onApprove: (businessId: string) => void;
  onReject: (businessId: string) => void;
}

export const BusinessTable = ({
  businesses,
  onViewDetails,
  onToggleFeatured,
  onApprove,
  onReject,
}: BusinessTableProps) => {
  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Business</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Trust Score</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {businesses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No businesses found.
              </TableCell>
            </TableRow>
          ) : (
            businesses.map((business) => (
              <TableRow key={business.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{business.name}</span>
                    <span className="text-xs text-muted-foreground">{business.tradeLicenseNo}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{business.ownerName}</span>
                    <span className="text-xs text-muted-foreground">{business.ownerEmail}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{business.category}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    business.trustScore >= 80 ? "default" :
                    business.trustScore >= 50 ? "secondary" :
                    "destructive"
                  }>
                    {business.trustScore}
                  </Badge>
                </TableCell>
                <TableCell>{business.productsCount}</TableCell>
                <TableCell>
                  <Badge variant={
                    business.verificationStatus === 'VERIFIED' ? "default" :
                    business.verificationStatus === 'REJECTED' ? "destructive" :
                    "secondary"
                  }>
                    {business.verificationStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  {business.isFeatured ? (
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  ) : (
                    <StarOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    } />
                    <DropdownMenuContent align="end" className="w-[200px]">
                      {/* Action: View Business Details */}
                      <DropdownMenuItem onClick={() => onViewDetails(business)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>

                      {/* Action: Toggle Featured Status */}
                      <DropdownMenuItem onClick={() => onToggleFeatured(business.id, business.isFeatured)}>
                        {business.isFeatured ? (
                          <>
                            <StarOff className="mr-2 h-4 w-4" />
                            Remove Featured
                          </>
                        ) : (
                          <>
                            <Star className="mr-2 h-4 w-4" />
                            Mark as Featured
                          </>
                        )}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {/* Action: Approve Verification */}
                      <DropdownMenuItem
                        onClick={() => onApprove(business.id)}
                        disabled={business.verificationStatus === 'VERIFIED'}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </DropdownMenuItem>

                      {/* Action: Reject Verification */}
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onReject(business.id)}
                        disabled={business.verificationStatus === 'REJECTED'}
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