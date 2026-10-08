"use client";

import { useState } from "react";
import { BadgeCheck, ChevronRight, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export interface TrustScoreFactor {
  name: string;
  detail: string;
  score: number;
  maximum: number;
}

interface TrustScoreBreakdownProps {
  score: number;
  factors: TrustScoreFactor[];
  businessName?: string;
  isLoading?: boolean;
  error?: string | null;
}

export default function TrustScoreBreakdown({
  score,
  factors,
  businessName = "Business",
  isLoading = false,
  error,
}: TrustScoreBreakdownProps) {
  const [open, setOpen] = useState(false);
  const safeScore = Number.isFinite(score) ? Math.min(100, Math.max(0, score)) : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant="outline" className="h-auto justify-between gap-3 rounded-xl p-3 text-left">
            <span className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-success/10 text-success"><ShieldCheck className="size-5" /></span>
              <span>
                <span className="block text-xs text-muted-foreground">Trust score</span>
                <span className="block text-lg font-semibold tabular-nums text-foreground">{safeScore}<span className="text-sm font-normal text-muted-foreground"> / 100</span></span>
              </span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Button>
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-success" />
            Trust score breakdown
          </DialogTitle>
          <DialogDescription>How {businessName}&apos;s current score is composed.</DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border border-success/20 bg-success/5 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Overall score</p>
              <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight text-foreground">{safeScore}<span className="text-lg font-medium text-muted-foreground">/100</span></p>
            </div>
            <Badge variant={safeScore >= 80 ? "success" : safeScore >= 50 ? "warning" : "danger"} className="gap-1.5"><Sparkles className="size-3.5" />{safeScore >= 80 ? "Strong" : safeScore >= 50 ? "Developing" : "Needs attention"}</Badge>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-secondary">
            <div className="h-full rounded-full bg-success" style={{ width: `${safeScore}%` }} />
          </div>
        </div>

        {error ? (
          <p role="alert" className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</p>
        ) : isLoading ? (
          <p role="status" className="rounded-lg border border-border bg-background/50 p-3 text-sm text-muted-foreground">Loading score details…</p>
        ) : factors.length ? (
          <div className="space-y-3">
          {factors.map(({ name, detail, score: points, maximum }) => {
            const safeMaximum = Number.isFinite(maximum) && maximum > 0 ? maximum : 1;
            const safePoints = Number.isFinite(points) ? Math.min(safeMaximum, Math.max(0, points)) : 0;
            return (
            <div key={name} className="rounded-xl border border-border bg-background/50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <BadgeCheck className="mt-0.5 size-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">{safePoints}<span className="font-normal text-muted-foreground">/{safeMaximum}</span></span>
              </div>
              <div className="ml-6 mt-3 h-1.5 overflow-hidden rounded-full bg-surface-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(safePoints / safeMaximum) * 100}%` }} />
              </div>
            </div>
          );
          })}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">No score breakdown details are available.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
