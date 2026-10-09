"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  Flag,
  Clock,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pie,
  PieChart,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  fetchModeratorDashboard,
  type IModeratorDashboard,
} from "@/lib/admin_api/get-moderator-dashboard";

// Updated by: Aritro
// Fetches live verifications + reports to compute moderator stats.

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export default function ModeratorOverviewPage() {
  const [dashboard, setDashboard] = useState<IModeratorDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchModeratorDashboard();
        setDashboard(data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        toast.error("Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const stats = dashboard?.stats ?? {
    totalVerifications: 0,
    pendingVerifications: 0,
    totalReports: 0,
    pendingReports: 0,
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Moderator Overview</h1>
        <p className="text-muted-foreground mt-1">
          Review verifications and reports to keep TrustPass safe.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Verifications"
          value={isLoading ? "..." : stats.totalVerifications}
          icon={ShieldCheck}
          colorClass="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          title="Pending Verifications"
          value={isLoading ? "..." : stats.pendingVerifications}
          icon={Clock}
          colorClass="bg-yellow-500/10 text-yellow-500"
          description="Awaiting your review"
        />
        <StatCard
          title="Total Reports"
          value={isLoading ? "..." : stats.totalReports}
          icon={Flag}
          colorClass="bg-purple-500/10 text-purple-500"
        />
        <StatCard
          title="Pending Reports"
          value={isLoading ? "..." : stats.pendingReports}
          icon={TrendingUp}
          colorClass="bg-destructive/10 text-destructive"
          description="Awaiting action"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Status Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
            <p className="text-sm text-muted-foreground">
              Breakdown of business verifications
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] bg-muted animate-pulse rounded-md" />
            ) : (dashboard?.verificationStatus?.length ?? 0) === 0 ? (
              <EmptyChart message="No verification data." />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboard!.verificationStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {dashboard!.verificationStatus.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      color: "var(--card-foreground)",
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: "var(--foreground)" }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Report Status Bar */}
        <Card>
          <CardHeader>
            <CardTitle>Report Status</CardTitle>
            <p className="text-sm text-muted-foreground">
              Breakdown of customer reports
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] bg-muted animate-pulse rounded-md" />
            ) : (dashboard?.reportStatus?.length ?? 0) === 0 ? (
              <EmptyChart message="No report data." />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboard!.reportStatus}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      color: "var(--card-foreground)",
                    }}
                    cursor={{ fill: "var(--muted)" }}
                  />
                  <Bar
                    dataKey="value"
                    fill="var(--chart-2)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Jump to your common tasks
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <QuickAction
            label="Review Verifications"
            value={stats.pendingVerifications}
            href="/dashboard/moderator/verification-queue"
            highlight={stats.pendingVerifications > 0}
            icon={ShieldCheck}
          />
          <QuickAction
            label="Review Reports"
            value={stats.pendingReports}
            href="/dashboard/moderator/reports"
            highlight={stats.pendingReports > 0}
            icon={Flag}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Inline helpers
// ============================================================

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass?: string;
  description?: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  colorClass = "bg-primary/10 text-primary",
  description,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

interface QuickActionProps {
  label: string;
  value: number;
  href: string;
  highlight?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

function QuickAction({
  label,
  value,
  href,
  highlight = false,
  icon: Icon,
}: QuickActionProps) {
  return (
    <a
      href={href}
      className={`flex items-center justify-between p-4 rounded-md border transition-colors ${
        highlight
          ? "border-primary/40 bg-primary/5 hover:bg-primary/10"
          : "hover:bg-muted"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-muted">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span
        className={`text-xl font-bold ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </a>
  );
}