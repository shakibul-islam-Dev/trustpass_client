"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Store,
  Star,
  Copy,
  Check,
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
import type { IBusinessResponse } from "@/lib/admin_api/get-businesses";

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
  businesses: IBusinessResponse[];
  onViewDetails: (business: IBusinessResponse) => void;
  onDelete: (business: IBusinessResponse) => void;
}

// ── Copyable Business ID component ──
const CopyableId = ({ id }: { id: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      toast.success("Business ID copied!");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Click to copy ID"
      className="group inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition"
    >
      <span className="truncate max-w-[100px]">
        {id.slice(0, 8)}...{id.slice(-4)}
      </span>
      {copied ? (
        <Check className="h-3 w-3 text-success shrink-0" />
      ) : (
        <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition shrink-0" />
      )}
    </button>
  );
};

export const BusinessTable = ({
  businesses,
  onViewDetails,
  onDelete,
}: BusinessTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(businesses.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginated = businesses.slice(startIndex, endIndex);

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[60px]">#</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Business ID</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Trust</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
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

                  {/* Business + Logo */}
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="relative size-9 rounded-full bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0">
                        {business.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={business.logoUrl}
                            alt={business.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Store className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate flex items-center gap-1">
                          {business.name}
                          {business.isFeatured && (
                            <Star className="h-3 w-3 text-warning fill-warning shrink-0" />
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {business.slug || "-"}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* ✅ Business ID — copyable */}
                  <TableCell>
                    <CopyableId id={business.id} />
                  </TableCell>

                  {/* Owner */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{business.ownerName || "Business Owner"}</span>
                      <span className="text-xs text-muted-foreground">
                        {business.ownerEmail || "-"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Trust */}
                  <TableCell>
                    <Badge
                      variant={
                        // The API leaves `trustScoreUpdatedAt` null until it
                        // calculates a score — a red "0" would read as a failed
                        // business rather than one that was never evaluated.
                        business.trustScoreUpdatedAt == null
                          ? "outline"
                          : business.trustScore >= 80
                            ? "default"
                            : business.trustScore >= 50
                              ? "secondary"
                              : "destructive"
                      }
                    >
                      {business.trustScoreUpdatedAt == null
                        ? "—"
                        : business.trustScore}
                    </Badge>
                  </TableCell>

                  {/* Products */}
                  <TableCell>{business.productsCount}</TableCell>

                  {/* Status */}
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

                  {/* Actions */}
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