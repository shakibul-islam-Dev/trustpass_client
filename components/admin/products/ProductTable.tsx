"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ImageOff,
  Store,
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
import { Badge } from "@/components/ui/badge";
import type { IProductResponse } from "@/lib/admin_api/get-products";

interface ProductTableProps {
  products: IProductResponse[];
  onViewDetails: (product: IProductResponse) => void;
  onDelete: (product: IProductResponse) => void;
}

const PAGE_SIZE = 20;

const getStatusVariant = (
  status: string | undefined
): "default" | "secondary" | "destructive" | "outline" => {
  switch (String(status || "ACTIVE").toUpperCase()) {
    case "ACTIVE":
      return "default";
    case "DRAFT":
      return "outline";
    case "INACTIVE":
      return "secondary";
    case "OUT_OF_STOCK":
    case "SUSPENDED":
      return "destructive";
    default:
      return "outline";
  }
};

const formatPrice = (price: number, currency: string = "BDT") => {
  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency} ${price.toLocaleString()}`;
  }
};

export const ProductTable = ({
  products,
  onViewDetails,
  onDelete,
}: ProductTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginated = products.slice(startIndex, endIndex);

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
              <TableHead>Product</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
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
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((product, index) => {
                const primaryImage = product.images?.[0];

                return (
                  <TableRow key={product.id}>
                    <TableCell className="text-muted-foreground text-sm">
                      {startIndex + index + 1}
                    </TableCell>

                    {/* Product — image + name + slug */}
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 rounded-md bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0">
                          {primaryImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={primaryImage}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="truncate max-w-[180px]">
                            {product.name}
                          </span>
                          <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {product.slug || "-"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Business — logo + name + slug (NO ID) */}
                    {/* Business — name + slug (NO logo) */}
                    <TableCell>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate max-w-[180px]">
                          {product.businessName || "-"}
                        </span>
                        {product.businessSlug && (
                          <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                            @{product.businessSlug}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Owner — name + email (NO ID) */}
                    <TableCell>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate max-w-[180px]">
                          {product.ownerName || "-"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {product.ownerEmail || "-"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Price */}
                    <TableCell className="font-medium">
                      {formatPrice(product.price, product.currency)}
                    </TableCell>

                    {/* Stock */}
                    <TableCell>
                      <Badge
                        variant={product.stock > 0 ? "outline" : "destructive"}
                      >
                        {product.stock}
                      </Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge variant={getStatusVariant(product.status)}>
                        {String(product.status || "ACTIVE").replace(/_/g, " ")}
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
                            onClick={() => onViewDetails(product)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete(product)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {products.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}–{Math.min(endIndex, products.length)} of{" "}
            {products.length} products
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