"use client";

import { useState, useEffect } from "react";
import { TrustRulesClient } from "@/components/admin/trust-rules/TrustRulesClient";
import { fetchTrustRules } from "@/lib/admin_api/get-trust-rules";
import type { TrustRule } from "@/types/admin";

/**
 * Previous implementation by: Existing Developer
 * Kept for reference because Server Component cannot forward cookies
 * to an external API (Next.js Server Component fetch does not include
 * browser cookies automatically).
 *
 * export const dynamic = "force-dynamic";
 * export default async function TrustRulesPage() {
 *   const rules = await fetchTrustRules();
 *   // ...
 * }
 *
 * Updated implementation for: Trust Rules page (Admin)
 * Client-side fetch — browser automatically sends cookies with
 * credentials: "include", so no manual cookie forwarding is needed.
 * Developer: Aritro
 */
export default function TrustRulesPage() {
  const [rules, setRules] = useState<TrustRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchTrustRules();
      setRules(data);
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Trust Rules Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Define rules that determine business trust scores.
        </p>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading trust rules...</div>
      ) : (
        <TrustRulesClient initialRules={rules} />
      )}
    </div>
  );
}