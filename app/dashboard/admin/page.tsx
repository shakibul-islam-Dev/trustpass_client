"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Users,
  Building2,
  ShieldCheck,
  Flag,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  Legend,
} from "recharts";
import {
  fetchAdminDashboard,
  type IAdminDashboard,
} from "@/lib/admin_api/get-dashboard";

// Updated by: Aritro
// Fetches live stats from /api/v1/admin/dashboard (client-side fetch).

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export default function AdminOverviewPage() {
  const [dashboard, setDashboard] = useState<IAdminDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAdminDashboard();
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
    totalUsers: 0,
    newUsersThisMonth: 0,
    totalBusinesses: 0,
    verifiedBusinesses: 0,
    pendingVerifications: 0,
    activeReports: 0,
    pendingReports: 0,
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, Admin. Here's what's happening on TrustPass.
        </p>
      </div>

      {/* Stats Grid — top row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={isLoading ? "..." : stats.totalUsers}
          icon={Users}
          colorClass="bg-primary/10 text-primary"
          description={
            stats.newUsersThisMonth > 0
              ? `+${stats.newUsersThisMonth} this month`
              : undefined
          }
        />
        <StatCard
          title="Total Businesses"
          value={isLoading ? "..." : stats.totalBusinesses}
          icon={Building2}
          colorClass="bg-blue-500/10 text-blue-500"
          description={
            stats.verifiedBusinesses > 0
              ? `${stats.verifiedBusinesses} verified`
              : undefined
          }
        />
        <StatCard
          title="Pending Verifications"
          value={isLoading ? "..." : stats.pendingVerifications}
          icon={ShieldCheck}
          colorClass="bg-yellow-500/10 text-yellow-500"
          description="Awaiting review"
        />
        <StatCard
          title="Active Reports"
          value={isLoading ? "..." : stats.activeReports}
          icon={Flag}
          colorClass="bg-destructive/10 text-destructive"
          description={
            stats.pendingReports > 0
              ? `${stats.pendingReports} pending`
              : undefined
          }
        />
      </div>

      {/* Stats Grid — second row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="New Users (Month)"
          value={isLoading ? "..." : stats.newUsersThisMonth}
          icon={TrendingUp}
          colorClass="bg-green-500/10 text-green-500"
        />
        <StatCard
          title="Verified Businesses"
          value={isLoading ? "..." : stats.verifiedBusinesses}
          icon={CheckCircle}
          colorClass="bg-emerald-500/10 text-emerald-500"
        />
        <StatCard
          title="Pending Reports"
          value={isLoading ? "..." : stats.pendingReports}
          icon={Flag}
          colorClass="bg-orange-500/10 text-orange-500"
        />
        <StatCard
          title="Total Categories"
          value={isLoading ? "..." : dashboard?.businessCategories.length ?? 0}
          icon={Building2}
          colorClass="bg-purple-500/10 text-purple-500"
        />
      </div>

      {/* Report Status Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Status</CardTitle>
            <p className="text-sm text-muted-foreground">
              Overview of customer reports
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] bg-muted animate-pulse rounded-md" />
            ) : (dashboard?.reportStatus?.length ?? 0) === 0 ? (
              <EmptyChart message="No report data available." />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboard!.reportStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {dashboard!.reportStatus.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
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

        {/* Quick Actions / Info Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Common admin shortcuts
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <QuickActionRow
              label="Review Verifications"
              value={stats.pendingVerifications}
              href="/dashboard/admin/verification-queue"
              highlight={stats.pendingVerifications > 0}
            />
            <QuickActionRow
              label="Review Reports"
              value={stats.pendingReports}
              href="/dashboard/admin/reports"
              highlight={stats.pendingReports > 0}
            />
            <QuickActionRow
              label="Manage Users"
              value={stats.totalUsers}
              href="/dashboard/admin/user-management"
            />
            <QuickActionRow
              label="Manage Businesses"
              value={stats.totalBusinesses}
              href="/dashboard/admin/businesses"
            />
          </CardContent>
        </Card>
      </div>
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <p className="text-sm text-muted-foreground">
              New users per day (last 7 days)
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] bg-muted animate-pulse rounded-md" />
            ) : (dashboard?.userGrowth?.length ?? 0) === 0 ? (
              <EmptyChart message="No user growth data available." />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboard!.userGrowth}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
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
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    dot={{ fill: "var(--chart-2)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Business Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Businesses by Category</CardTitle>
            <p className="text-sm text-muted-foreground">
              Distribution across categories
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] bg-muted animate-pulse rounded-md" />
            ) : (dashboard?.businessCategories?.length ?? 0) === 0 ? (
              <EmptyChart message="No category data available." />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboard!.businessCategories}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="category"
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
                    dataKey="count"
                    fill="var(--chart-1)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

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

interface QuickActionRowProps {
  label: string;
  value: number;
  href: string;
  highlight?: boolean;
}

function QuickActionRow({
  label,
  value,
  href,
  highlight = false,
}: QuickActionRowProps) {
  return (
    <a
      href={href}
      className={`flex items-center justify-between p-3 rounded-md border transition-colors ${
        highlight
          ? "border-primary/40 bg-primary/5 hover:bg-primary/10"
          : "hover:bg-muted"
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <span
        className={`text-lg font-bold ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </a>
  );
}