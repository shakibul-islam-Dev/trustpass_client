"use client";

import { AlertTriangle, ChevronRight, Filter, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const reportRows = [
  { id: "RPT-1042", title: "Late delivery", status: "Open", tone: "warning" as const },
  { id: "RPT-1040", title: "Item damaged", status: "Resolved", tone: "success" as const },
  { id: "RPT-1037", title: "Wrong product", status: "Review", tone: "primary-soft" as const },
];

const Reports = () => {
  return (
    <Card className="border-border/80 bg-surface shadow-surface">
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Reports</CardTitle>
            <CardDescription>Buyer and customer issue history</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search reports" className="h-10 w-52 pl-9" />
            </div>
            <Button type="button" variant="outline" className="gap-2">
              <Filter className="size-4" />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {reportRows.map(({ id, title, status, tone }) => (
          <div key={id} className="flex flex-col gap-3 rounded-2xl border border-border bg-background/50 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
                <AlertTriangle className="size-4" />
              </div>
              <div>
                <p className="font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{id}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={tone}>{status}</Badge>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={`View ${title}`}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default Reports;
