"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, X, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductCatalogFiltersProps {
  query: string;
  statusFilter: string;
  totalCount: number;
  filteredCount: number;
}

export function ProductCatalogFilters({
  query,
  statusFilter,
  totalCount,
  filteredCount,
}: ProductCatalogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(query);

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "ALL" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ query: searchTerm });
  };

  const handleClear = () => {
    setSearchTerm("");
    router.push("/products");
  };

  const isFiltering = query !== "" || statusFilter !== "ALL";

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 max-w-md"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search products..."
            className="pl-9 pr-20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            {searchTerm && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => {
                  setSearchTerm("");
                  updateFilters({ query: null });
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
            >
              Search
            </Button>
          </div>
        </form>

        {/* Status filter */}
        <Select
          value={statusFilter}
          onValueChange={(v) => updateFilters({ status: v })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear */}
        {isFiltering && (
          <Button variant="outline" onClick={handleClear} className="gap-1.5">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Count badge */}
      <div className="flex items-center gap-2">
        <Badge
          variant={isFiltering ? "default" : "secondary"}
          className="gap-1.5"
        >
          <Package className="h-3 w-3" />
          {isFiltering
            ? `${filteredCount} of ${totalCount} products`
            : `${totalCount} products`}
        </Badge>
      </div>
    </div>
  );
}