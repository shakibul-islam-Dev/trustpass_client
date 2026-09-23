"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export interface ScoreRuleItem {
  id: string;
  name: string;
  category: string;
  maxPoints: number;
  earnedPoints: number;
  status: "PASSED" | "PARTIAL" | "FAILED" | "PENDING";
  description: string;
}

interface ScoreBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName?: string;
  initialScore?: number;
  lastCalculatedAt?: string;
}

const DEFAULT_BREAKDOWN_RULES: ScoreRuleItem[] = [
  {
    id: "r1",
    name: "Valid Trade License",
    category: "Legal & Verification",
    maxPoints: 25,
    earnedPoints: 25,
    status: "PASSED",
    description: "Official government trade license submitted and verified by moderator.",
  },
  {
    id: "r2",
    name: "National ID (NID) Verified",
    category: "Identity Verification",
    maxPoints: 30,
    earnedPoints: 30,
    status: "PASSED",
    description: "Business owner identity document verified.",
  },
  {
    id: "r3",
    name: "Complete Business Profile",
    category: "Profile Completeness",
    maxPoints: 15,
    earnedPoints: 15,
    status: "PASSED",
    description: "Contact information, logo, cover image, and description fully provided.",
  },
  {
    id: "r4",
    name: "Verified Customer Reviews",
    category: "Reputation & Feedback",
    maxPoints: 20,
    earnedPoints: 15,
    status: "PARTIAL",
    description: "Average customer rating above 4.5 stars with at least 5 verified orders.",
  },
  {
    id: "r5",
    name: "Customer Fraud & Dispute Penalty",
    category: "Risk & Compliance",
    maxPoints: 0,
    earnedPoints: 0,
    status: "PASSED",
    description: "Zero confirmed scam or fraudulent transaction complaints on record.",
  },
];

export const ScoreBreakdownModal = ({
  isOpen,
  onClose,
  businessName = "Tech Solutions Ltd.",
  initialScore = 85,
  lastCalculatedAt = "2026-09-22 14:30:00",
}: ScoreBreakdownModalProps) => {
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [currentScore, setCurrentScore] = useState(initialScore);
  const [lastCalculated, setLastCalculated] = useState(lastCalculatedAt);
  const [recalcSuccess, setRecalcSuccess] = useState(false);

  const handleRecalculate = () => {
    setIsRecalculating(true);
    setRecalcSuccess(false);

    // Simulate recalculation algorithm execution
    setTimeout(() => {
      const newScore = Math.min(100, Math.max(70, currentScore + (Math.random() > 0.5 ? 2 : -1)));
      setCurrentScore(newScore);
      setLastCalculated(new Date().toLocaleString());
      setIsRecalculating(false);
      setRecalcSuccess(true);

      setTimeout(() => {
        setRecalcSuccess(false);
      }, 4000);
    }, 900);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <DialogTitle>Trust Score Breakdown</DialogTitle>
          </div>
          <DialogDescription>
            Audit and live re-evaluation of trust factors for <strong>{businessName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Top Score Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-extrabold text-primary">
                {currentScore}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Calculated Trust Score
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={currentScore >= 80 ? "default" : "secondary"}>
                    {currentScore >= 80 ? "High Credibility" : "Moderate Credibility"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Max: 100 points
                  </span>
                </div>
              </div>
            </div>

            {/* Recalculate Trigger Button */}
            <Button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              variant="outline"
              size="sm"
              className="gap-2 shrink-0 border-primary/40 hover:bg-primary/10 hover:text-primary"
            >
              <RefreshCw className={`h-4 w-4 ${isRecalculating ? "animate-spin text-primary" : ""}`} />
              {isRecalculating ? "Recalculating..." : "Recalculate Score"}
            </Button>
          </div>

          {/* Feedback alert after recalculation */}
          {recalcSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Trust score recomputed successfully based on current verification rules.</span>
            </div>
          )}

          {/* Rules Breakdown List */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Rule Contributions & Weighting
            </h4>
            <div className="space-y-2.5">
              {DEFAULT_BREAKDOWN_RULES.map((rule) => {
                return (
                  <div
                    key={rule.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-border bg-card p-3 text-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{rule.name}</span>
                        <span className="text-[10px] text-muted-foreground rounded bg-muted px-1.5 py-0.5">
                          {rule.category}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{rule.description}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <span className="text-xs font-bold text-foreground">
                        +{rule.earnedPoints} / {rule.maxPoints} pts
                      </span>
                      <Badge
                        variant={
                          rule.status === "PASSED"
                            ? "default"
                            : rule.status === "PARTIAL"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-[10px]"
                      >
                        {rule.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calculation Metadata */}
          <div className="rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground flex items-center justify-between">
            <span>Last calculated: {lastCalculated}</span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" /> Algorithmic v2.4
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
