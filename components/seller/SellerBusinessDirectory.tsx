"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getBusinesses } from "@/lib/business-api/all-business";
import type { IBusiness, IBusinessesResponse } from "@/types/business";
import BusinessRecordsTable, { type BusinessRecord } from "./BusinessRecordsTable";

const toBusinessRecord = (business: IBusiness): BusinessRecord => ({
  id: business.id,
  name: business.name,
  category: business.categoryId ?? "Uncategorized",
  status:
    business.verificationStatus === "VERIFIED"
      ? "Active"
      : business.verificationStatus === "REJECTED" || business.verificationStatus === "SUSPENDED"
        ? "Needs attention"
        : "Pending",
  updatedAt: business.updatedAt,
});

export default function SellerBusinessDirectory() {
  const [records, setRecords] = useState<BusinessRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const loadBusinesses = async () => {
      try {
        const response: IBusinessesResponse = await getBusinesses({ page: 1, limit: 100 });
        if (!response.success || !response.data) {
          throw new Error(response.error || response.message || "Could not load businesses.");
        }
        if (active) {
          setRecords(response.data.map(toBusinessRecord));
          setError(null);
        }
      } catch (loadError) {
        console.error("Could not load businesses:", loadError);
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Could not load businesses.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void loadBusinesses();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" className="gap-2" disabled={isLoading} onClick={() => { setIsLoading(true); setReloadKey((key) => key + 1); }}>
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/30 bg-danger/5 p-3">
          <p role="alert" className="text-sm text-danger">{error}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => { setIsLoading(true); setReloadKey((key) => key + 1); }}>Try again</Button>
        </div>
      )}
      <BusinessRecordsTable records={records} isLoading={isLoading} />
    </div>
  );
}
