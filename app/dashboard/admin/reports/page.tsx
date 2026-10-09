"use client";

import { useState, useEffect } from "react";
import { fetchReports } from "@/lib/admin_api/get-reports";
import { ReportsClient } from "@/components/admin/reports-review/ReportsClient";

/**
 * Previous implementation by: Existing Developer
 * Kept for reference because Server Component cannot forward cookies.
 *
 * export default async function ReportsPage() {
 *   const reports = await fetchReports();
 *   // ...
 * }
 *
 * Updated implementation for: Reports page (Admin)
 * Client-side fetch — cookie automatic goes via credentials: "include".
 * Developer: Aritro
 */
export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchReports({ page: 1, limit: 100 });
      setReports(data);
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Report Review
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and take action on customer reports.
        </p>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading reports...</div>
      ) : (
        <ReportsClient initialReports={reports} />
      )}
    </div>
  );
}