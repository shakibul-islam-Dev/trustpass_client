"use client";

import { BusinessCategoryChart } from "@/components/admin/overview/BusinessCategoryChart";
import { ReportStatusChart } from "@/components/admin/overview/ReportStatusChart";
import { StatCard } from "@/components/admin/overview/StatCard";
import { UserGrowthChart } from "@/components/admin/overview/UserGrowthChart";
import { Users, Building2, ShieldCheck, Flag } from "lucide-react";


// --- Dummy Data ---
const STATS = [
  { title: "Total Users", value: "1,250", icon: Users, trend: { value: "12% this month", isPositive: true } },
  { title: "Total Businesses", value: "340", icon: Building2, trend: { value: "5% this month", isPositive: true } },
  { title: "Pending Verifications", value: "12", icon: ShieldCheck, description: "Awaiting review" },
  { title: "Active Reports", value: "8", icon: Flag, trend: { value: "3 new today", isPositive: false } },
];

const USER_GROWTH_DATA = [
  { date: "Mon", users: 45 },
  { date: "Tue", users: 62 },
  { date: "Wed", users: 55 },
  { date: "Thu", users: 78 },
  { date: "Fri", users: 95 },
  { date: "Sat", users: 88 },
  { date: "Sun", users: 110 },
];

const BUSINESS_CATEGORY_DATA = [
  { category: "IT", count: 85 },
  { category: "Retail", count: 120 },
  { category: "Food", count: 65 },
  { category: "Fashion", count: 45 },
  { category: "Health", count: 25 },
];

const REPORT_STATUS_DATA = [
  { name: "Pending", value: 12 },
  { name: "Resolved", value: 25 },
  { name: "Rejected", value: 8 },
];

const AdminOverview = () => {
  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, Admin. Here's what's happening on TrustPass.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            description={stat.description}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserGrowthChart data={USER_GROWTH_DATA} />
        <BusinessCategoryChart data={BUSINESS_CATEGORY_DATA} />
      </div>

      {/* Pie Chart - Full Width on Mobile, Half on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportStatusChart data={REPORT_STATUS_DATA} />
      </div>
    </div>
  );
};

export default AdminOverview;