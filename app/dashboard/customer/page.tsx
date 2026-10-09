"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerStatCard } from "@/components/customer/overview/CustomerStatCard";
import { RecentActivityList } from "@/components/customer/overview/RecentActivityList";
import {
  fetchCustomerStats,
  fetchRecentActivity,
  type ICustomerStats,
  type IRecentActivity,
} from "@/lib/customer_api/overview";

// Previous implementation by: Existing Developer
// Updated by: Aritro
// Reason: Now uses real API via fetchCustomerStats + fetchRecentActivity.

export default function CustomerOverviewPage() {
  const router = useRouter();

  const [stats, setStats] = useState<ICustomerStats>({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    rejectedReports: 0,
    unreadNotifications: 0,
    totalNotifications: 0,
  });
  const [activities, setActivities] = useState<IRecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [statsData, activitiesData] = await Promise.all([
          fetchCustomerStats(),
          fetchRecentActivity(5),
        ]);
        setStats(statsData);
        setActivities(activitiesData);
      } catch (error) {
        console.error("Failed to load overview:", error);
        toast.error("Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your activity.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/customer/notifications")}
          >
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
          <Button onClick={() => router.push("/dashboard/customer/reports")}>
            {/* <Plus className="mr-2 h-4 w-4" /> */}
            My Report
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CustomerStatCard
          title="Total Reports"
          value={isLoading ? "..." : stats.totalReports}
          icon={FileText}
          description="All time"
          colorClass="bg-primary/10 text-primary"
        />
        <CustomerStatCard
          title="Pending"
          value={isLoading ? "..." : stats.pendingReports}
          icon={Clock}
          description="Awaiting review"
          colorClass="bg-yellow-500/10 text-yellow-500"
        />
        <CustomerStatCard
          title="Resolved"
          value={isLoading ? "..." : stats.resolvedReports}
          icon={CheckCircle}
          description="Action taken"
          colorClass="bg-green-500/10 text-green-500"
        />
        <CustomerStatCard
          title="Unread Notifications"
          value={isLoading ? "..." : stats.unreadNotifications}
          icon={Bell}
          description={`${stats.totalNotifications} total`}
          colorClass="bg-purple-500/10 text-purple-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-start gap-1"
          onClick={() => router.push("/dashboard/customer/reports")}
        >
          <div className="flex items-center gap-2 font-semibold">
            <FileText className="h-4 w-4" />
            My Reports
          </div>
          <span className="text-xs text-muted-foreground font-normal">
            View all your submitted reports
          </span>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-start gap-1"
          onClick={() => router.push("/dashboard/customer/notifications")}
        >
          <div className="flex items-center gap-2 font-semibold">
            <Bell className="h-4 w-4" />
            Notifications
          </div>
          <span className="text-xs text-muted-foreground font-normal">
            {stats.unreadNotifications > 0
              ? `You have ${stats.unreadNotifications} unread`
              : "You are all caught up"}
          </span>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-start gap-1"
          onClick={() => router.push("/businessesExplore")}
        >
          <div className="flex items-center gap-2 font-semibold">
            <Search className="h-4 w-4" />
            Browse Businesses
          </div>
          <span className="text-xs text-muted-foreground font-normal">
            Explore verified businesses
          </span>
        </Button>
      </div>

      {/* Recent Activity */}
      <RecentActivityList activities={activities} isLoading={isLoading} />
    </div>
  );
}