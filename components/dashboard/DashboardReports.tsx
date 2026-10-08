"use client";

import { AlertCircle, ChevronRight, Flag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const reports = [
  { title: "Delivery dispute", status: "Pending", tone: "warning" as const },
  { title: "Return request", status: "Resolved", tone: "success" as const },
  { title: "Product quality issue", status: "Open", tone: "primary-soft" as const },
];

const DashboardReports = () => {
  return (
    <Card className="border-border/80 bg-surface shadow-surface">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Recent reports</CardTitle>
            <CardDescription>Open customer issues and disputes</CardDescription>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
            <Flag className="size-4" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {reports.map(({ title, status, tone }) => (
          <div key={title} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/50 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <AlertCircle className="size-4" />
              </div>
              <div>
                <p className="font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">Updated 2 hours ago</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={tone}>{status}</Badge>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={`Open ${title}`}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default DashboardReports;
