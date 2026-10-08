"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export interface BusinessRecord {
  id: string;
  name: string;
  category: string;
  status: "Active" | "Pending" | "Needs attention";
  updatedAt: string;
}

interface BusinessRecordsTableProps {
  records: BusinessRecord[];
  pageSize?: number;
  isLoading?: boolean;
}

type SortKey = "name" | "category" | "status" | "updatedAt";

const statusVariant: Record<BusinessRecord["status"], "success" | "warning" | "danger"> = {
  Active: "success",
  Pending: "warning",
  "Needs attention": "danger",
};

export default function BusinessRecordsTable({ records, pageSize = 5, isLoading = false }: BusinessRecordsTableProps) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [descending, setDescending] = useState(true);
  const [page, setPage] = useState(0);

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return records
      .filter((record) =>
        `${record.name} ${record.category} ${record.status} ${record.id}`.toLowerCase().includes(normalizedQuery),
      )
      .sort((first, second) => {
        const comparison = first[sortKey].localeCompare(second[sortKey], undefined, {
          numeric: true,
          sensitivity: "base",
        });
        return descending ? -comparison : comparison;
      });
  }, [descending, query, records, sortKey]);

  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 5;
  const pageCount = Math.ceil(filteredRecords.length / safePageSize);
  const currentPage = Math.min(page, Math.max(0, pageCount - 1));
  const visibleRecords = filteredRecords.slice(currentPage * safePageSize, (currentPage + 1) * safePageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setDescending((current) => !current);
    } else {
      setSortKey(key);
      setDescending(false);
    }
    setPage(0);
  };

  const sortButton = (label: string, key: SortKey) => (
    <button type="button" className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary" onClick={() => toggleSort(key)} aria-label={`Sort by ${label}`}>
      {label}
      {sortKey === key ? <ChevronDown className={`size-3.5 transition-transform ${descending ? "rotate-180" : ""}`} /> : <ChevronsUpDown className="size-3.5 text-muted-foreground" />}
    </button>
  );

  const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  };

  return (
    <Card className="border-border/80 bg-surface shadow-surface">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Business records</CardTitle>
            <CardDescription>Search, sort, and review listed businesses.</CardDescription>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
              placeholder="Search records"
              aria-label="Search business records"
              className="h-10 pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p role="status" className="rounded-xl border border-border bg-background/40 px-4 py-10 text-center text-sm text-muted-foreground">Loading records…</p>
        ) : filteredRecords.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
            <p className="text-sm font-medium text-foreground">{records.length ? "No matching records" : "No records yet"}</p>
            <p className="mt-1 text-xs text-muted-foreground">{records.length ? "Try a different search term." : "Records will appear here when available."}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="border-b border-border bg-background/60">
                  <tr>
                    <th scope="col" className="px-4 py-3">{sortButton("Business", "name")}</th>
                    <th scope="col" className="px-4 py-3">{sortButton("Category", "category")}</th>
                    <th scope="col" className="px-4 py-3">{sortButton("Status", "status")}</th>
                    <th scope="col" className="px-4 py-3">{sortButton("Updated", "updatedAt")}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRecords.map((record) => (
                    <tr key={record.id} className="border-b border-border/70 last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{record.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{record.id}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{record.category}</td>
                      <td className="px-4 py-3"><Badge variant={statusVariant[record.status]}>{record.status}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(record.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {currentPage * safePageSize + 1}–{Math.min((currentPage + 1) * safePageSize, filteredRecords.length)} of {filteredRecords.length}
              </p>
              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" className="gap-1" disabled={currentPage === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>
                  <ChevronLeft className="size-4" />Previous
                </Button>
                <span className="min-w-16 text-center text-xs text-muted-foreground">Page {currentPage + 1} of {pageCount}</span>
                <Button type="button" variant="outline" size="sm" className="gap-1" disabled={currentPage + 1 >= pageCount} onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}>
                  Next<ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
