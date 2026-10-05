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
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Reports
              </p>
              <p className="text-3xl font-bold">{total}</p>
            </div>
            <div className="p-3 rounded-full bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Pending
              </p>
              <p className="text-3xl font-bold">{pending}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-500/10">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resolved */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Resolved
              </p>
              <p className="text-3xl font-bold">{resolved}</p>
            </div>
            <div className="p-3 rounded-full bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rejected */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Rejected
              </p>
              <p className="text-3xl font-bold">{rejected}</p>
            </div>
            <div className="p-3 rounded-full bg-destructive/10">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};