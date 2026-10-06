import { TrustRulesClient } from "@/components/admin/trust-rules/TrustRulesClient";
import { fetchTrustRules } from "@/lib/admin_api/get-trust-rules";
export const dynamic = "force-dynamic";
/**
 * Server Component — fetches initial trust rules on the server.
 */
export default async function TrustRulesPage() {
  const rules = await fetchTrustRules();

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

      <TrustRulesClient initialRules={rules} />
    </div>
  );
}