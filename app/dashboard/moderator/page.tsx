"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Flag, Scale, CheckCircle2, Clock, ArrowRight, AlertTriangle } from "lucide-react";

export default function ModeratorOverview() {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
            <Shield className="h-3.5 w-3.5" /> Moderator Operational Console
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Moderator Overview</h1>
          <p className="text-muted-foreground mt-1">
            Review business credentials, manage dispute reports, and monitor trust scoring integrity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/moderator/reports"
            className={buttonVariants({ variant: "outline" })}
          >
            <Flag className="mr-2 h-4 w-4 text-amber-500" />
            View Reports
          </Link>
          <Link
            href="/dashboard/moderator/verification-queue"
            className={buttonVariants({ variant: "default" })}
          >
            <Shield className="mr-2 h-4 w-4" />
            Verification Queue
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6 Requests</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting trade license & NID audit</p>
            <div className="mt-3">
              <Link
                href="/dashboard/moderator/verification-queue"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                Review queue <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Customer Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 Open</div>
            <p className="text-xs text-muted-foreground mt-1">3 High priority fraud cases</p>
            <div className="mt-3">
              <Link
                href="/dashboard/moderator/reports"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                Resolve reports <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Trust Rules</CardTitle>
            <Scale className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6 Rules</div>
            <p className="text-xs text-muted-foreground mt-1">Algorithm v2.4 active</p>
            <div className="mt-3">
              <Link
                href="/dashboard/moderator/trust-rules"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                Inspect rules <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Directory Trust</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82 / 100</div>
            <p className="text-xs text-muted-foreground mt-1">+4.2% higher than last month</p>
            <div className="mt-3">
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/20 bg-emerald-500/10">
                Healthy Directory
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Workspaces */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-2">
              <Shield className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Document Verifications</CardTitle>
            <CardDescription>
              Validate government trade licenses, tax identification numbers (TIN), and owner identity records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/moderator/verification-queue"
              className={buttonVariants({ variant: "default", className: "w-full" })}
            >
              Open Verification Queue
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center mb-2">
              <Flag className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Fraud & Dispute Review</CardTitle>
            <CardDescription>
              Investigate buyer complaints, verify submitted evidence, and resolve or dismiss dispute tickets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/moderator/reports"
              className={buttonVariants({ variant: "outline", className: "w-full" })}
            >
              Open Reports Resolution Panel
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2">
              <Scale className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Trust Rules & Scoring</CardTitle>
            <CardDescription>
              View the trust scoring weighting formula, inspect score breakdowns, and trigger recalculations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/moderator/trust-rules"
              className={buttonVariants({ variant: "outline", className: "w-full" })}
            >
              View Rules & Recalculate
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}