"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, FileText, XCircle } from "lucide-react";

interface CustomerReportStatsProps {
  total: number;
  pending: number;
  resolved: number;
  rejected?: number;
}

export const CustomerReportStats = ({
  total,
  pending,
  resolved,
  rejected = 0,
}: CustomerReportStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Reports
              </p>
              <p className="text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">{total}</p>
            </div>
            <div className="shrink-0 rounded-full bg-primary/10 p-3">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Pending
              </p>
              <p className="text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">{pending}</p>
            </div>
            <div className="shrink-0 rounded-full bg-warning-soft p-3">
              <Clock className="h-5 w-5 text-warning" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resolved */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Resolved
              </p>
              <p className="text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">{resolved}</p>
            </div>
            <div className="shrink-0 rounded-full bg-success-soft p-3">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rejected */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Rejected
              </p>
              <p className="text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">{rejected}</p>
            </div>
            <div className="shrink-0 rounded-full bg-destructive/10 p-3">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};