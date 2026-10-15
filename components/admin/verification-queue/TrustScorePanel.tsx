"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCw, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getTrustScoreHistory,
  type TrustScoreHistoryEntry,
} from "@/lib/core/business-api";
import {
  fetchTrustRules,
  type ITrustRuleResponse,
} from "@/lib/admin_api/get-trust-rules";
import { recalculateTrustScore } from "@/lib/admin_action/trust-scores_action";

/**
 * Live trust-score panel for a business under review.
 *
 * Everything shown here comes from a real API read:
 *   GET  /api/v1/trust-scores/business/:id   (public snapshot)
 *   GET  /api/v1/trust-rules                 (MODERATOR / ADMIN)
 * and the "Recalculate" action hits
 *   POST /api/v1/trust-scores/business/:id/recalculate
 *
 * The per-rule *awarded* points are deliberately not shown: the API only
 * exposes the `businessTrustScore` ledger via unrouted service code, and the
 * `trustScore.breakdown` snapshot is written once (single rule) and never
 * refreshed — so a per-rule breakdown cannot be rendered truthfully.
 */
interface TrustScorePanelProps {
  businessId: string;
}

export const TrustScorePanel = ({ businessId }: TrustScorePanelProps) => {
  const [entries, setEntries] = useState<TrustScoreHistoryEntry[]>([]);
  const [rules, setRules] = useState<ITrustRuleResponse[]>([]);
  // `isLoading` starts true and is only cleared after the awaits, so the
  // effect never calls setState synchronously.
  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const load = useCallback(async () => {
    try {
      const [history, ruleList] = await Promise.all([
        getTrustScoreHistory(businessId),
        fetchTrustRules({ status: "ACTIVE" }),
      ]);
      setEntries(history.ok && Array.isArray(history.data) ? history.data : []);
      setRules(ruleList);
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      const result = await recalculateTrustScore(businessId);
      if (result.error) {
        toast.error(result.message || "Failed to recalculate trust score.");
        return;
      }
      toast.success(`Trust score recalculated: ${result.score}/100.`);
      await load();
    } finally {
      setIsRecalculating(false);
    }
  };

  const latest: TrustScoreHistoryEntry | undefined = entries[0];
  const score = latest ? Math.min(100, Math.max(0, Number(latest.score))) : 0;
  const badgeVariant = !latest
    ? "outline"
    : score >= 80
      ? "success"
      : score >= 50
        ? "warning"
        : "danger";

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          Trust score
        </span>
        {isLoading ? (
          <span className="text-sm text-muted-foreground">Loading…</span>
        ) : (
          <Badge variant={badgeVariant}>
            {latest ? `${score}/100` : "—"}
          </Badge>
        )}
      </div>

      {!isLoading && (
        <p className="mt-2 text-xs text-muted-foreground">
          {latest
            ? `Last calculated ${new Date(latest.calculatedAt).toLocaleString()}.`
            : "No trust score has been recorded yet."}
        </p>
      )}

      {!isLoading && rules.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-muted-foreground">
            Points are awarded when a document is approved against an active
            rule:
          </p>
          <ul className="mt-1.5 space-y-1">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <span className="truncate text-foreground">{rule.label}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {rule.points} pts
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3 gap-1.5"
        onClick={handleRecalculate}
        disabled={isRecalculating || isLoading}
      >
        {isRecalculating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <RefreshCw className="h-3.5 w-3.5" />
        )}
        Recalculate
      </Button>
    </div>
  );
};
