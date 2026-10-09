"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  Star,
  StarOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
import type { Business } from "@/types/admin";

// Backend can return PENDING | UNDER_REVIEW | APPROVED | REJECTED | SUSPENDED | VERIFIED.
// The frontend Business type narrows to PENDING | VERIFIED | REJECTED, so we normalize.
const getStatusVariant = (
  status: string | undefined
): "default" | "secondary" | "destructive" => {
  switch (String(status || "PENDING").toUpperCase()) {
    case "VERIFIED":
    case "APPROVED":
      return "default";
    case "REJECTED":
    case "SUSPENDED":
      return "destructive";
    default:
      return "secondary";
  }
};

const PAGE_SIZE = 20;

interface BusinessTableProps {
  businesses: Business[];
  onViewDetails: (business: Business) => void;
  onDelete: (business: Business) => void;
}

export const BusinessTable = ({
  businesses,
  onViewDetails,
  onDelete,
}: BusinessTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(businesses.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginated = businesses.slice(startIndex, endIndex);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[60px]">#</TableHead>
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
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground"
                >
                  No businesses found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((business, index) => (
                <TableRow key={business.id}>
                  <TableCell className="text-muted-foreground text-sm">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{business.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {business.tradeLicenseNo}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{business.ownerName}</span>
                      <span className="text-xs text-muted-foreground">
                        {business.ownerEmail}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{business.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        business.trustScore >= 80
                          ? "default"
                          : business.trustScore >= 50
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {business.trustScore}
                    </Badge>
                  </TableCell>
                  <TableCell>{business.productsCount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusVariant(
                        business.verificationStatus as string
                      )}
                    >
                      {String(business.verificationStatus || "PENDING").replace(
                        /_/g,
                        " "
                      )}
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
                      <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuItem
                          onClick={() => onViewDetails(business)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete(business)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Business
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
      {businesses.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}–{Math.min(endIndex, businesses.length)} of{" "}
            {businesses.length} businesses
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