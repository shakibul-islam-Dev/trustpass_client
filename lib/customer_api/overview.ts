// Updated implementation for: Customer Overview page
// Client-side fetch — cookie automatic goes via credentials: "include".
// Developer: Aritro
import { apiUrl } from "@/lib/core/api-url";
import { fetchMyReports } from "./my_reports";
import { fetchMyNotifications } from "./notifications";



export interface ICustomerStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  rejectedReports: number;
  unreadNotifications: number;
  totalNotifications: number;
}

// ============================================================
// GET /api/v1/reports/me + notifications — compute stats
// ============================================================

export const fetchCustomerStats = async (): Promise<ICustomerStats> => {
  console.log("🔍 fetchCustomerStats: fetching reports + notifications");

  const [reports, notifications] = await Promise.all([
    fetchMyReports("?limit=100"),
    fetchMyNotifications("?limit=100"),
  ]);

  const stats: ICustomerStats = {
    totalReports: reports.length,
    pendingReports: reports.filter((r) => r.status === "PENDING").length,
    resolvedReports: reports.filter((r) => r.status === "RESOLVED").length,
    rejectedReports: reports.filter((r) => r.status === "REJECTED").length,
    unreadNotifications: notifications.filter((n) => !n.isRead).length,
    totalNotifications: notifications.length,
  };

  console.log("✅ fetchCustomerStats:", stats);
  return stats;
};

// ============================================================
// Recent activity — combine reports + notifications
// ============================================================

export interface IRecentActivity {
  id: string;
  type: "REPORT" | "NOTIFICATION";
  title: string;
  description: string;
  status?: string;
  createdAt: string;
  link?: string;
}

export const fetchRecentActivity = async (
  limit = 5
): Promise<IRecentActivity[]> => {
  const [reports, notifications] = await Promise.all([
    fetchMyReports("?limit=20"),
    fetchMyNotifications("?limit=20"),
  ]);

  const reportActivities: IRecentActivity[] = reports.map((r) => ({
    id: `report_${r.id}`,
    type: "REPORT",
    title: `Report against ${r.businessName || "Business"}`,
    description: r.title || r.description.slice(0, 80),
    status: r.status,
    createdAt: r.createdAt,
    link: "/dashboard/customer/reports",
  }));

  const notificationActivities: IRecentActivity[] = notifications.map((n) => ({
    id: `notif_${n.id}`,
    type: "NOTIFICATION",
    title: n.title,
    description: n.message.slice(0, 80),
    createdAt: n.createdAt,
    link: "/dashboard/customer/notifications",
  }));

  // Merge and sort by date (newest first)
  const merged = [...reportActivities, ...notificationActivities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return merged.slice(0, limit);
};