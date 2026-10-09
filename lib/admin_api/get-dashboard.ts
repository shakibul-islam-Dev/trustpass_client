// Updated implementation for: Admin Overview (Dashboard)
// Client-side fetch + response normalization.
// Backend returns nested stat objects like:
//   totalUsers: { total, newThisMonth, byRole }
//   totalBusinesses: { total, verified, ... }
//   activeReports: { total, pending, byStatus }
// We normalize these to plain numbers for the UI.
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";

export interface IAdminDashboardStats {
  totalUsers: number;
  newUsersThisMonth: number;
  totalBusinesses: number;
  verifiedBusinesses: number;
  pendingVerifications: number;
  activeReports: number;
  pendingReports: number;
}

export interface IUserGrowthPoint {
  date: string;
  users: number;
}

export interface IBusinessCategoryPoint {
  category: string;
  count: number;
}

export interface IReportStatusPoint {
  name: string;
  value: number;
}

export interface IAdminDashboard {
  stats: IAdminDashboardStats;
  userGrowth: IUserGrowthPoint[];
  businessCategories: IBusinessCategoryPoint[];
  reportStatus: IReportStatusPoint[];
}

// ============================================================
// Helpers — extract numbers from objects or plain values
// ============================================================

/**
 * Backend sometimes sends stats as objects like { total, pending, byRole }.
 * Extract a plain number from it, falling back to known keys.
 */
const toNumber = (value: unknown, ...preferredKeys: string[]): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    for (const key of preferredKeys) {
      const v = obj[key];
      if (typeof v === "number" && Number.isFinite(v)) return v;
    }
    // Fallback: try common keys
    for (const key of ["total", "count", "value"]) {
      const v = obj[key];
      if (typeof v === "number" && Number.isFinite(v)) return v;
    }
  }
  return 0;
};

/**
 * Extract a nested object by key.
 */
const toObject = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
};

/**
 * Turn `{ PENDING: 2, RESOLVED: 5 }` into `[{name, value}, ...]`.
 */
const objectToPieData = (
  obj: Record<string, unknown>
): IReportStatusPoint[] => {
  return Object.entries(obj)
    .filter(([, v]) => typeof v === "number")
    .map(([name, value]) => ({
      name: name.replace(/_/g, " "),
      value: value as number,
    }));
};

// ============================================================
// GET /api/v1/admin/dashboard
// ============================================================

const EMPTY_DASHBOARD: IAdminDashboard = {
  stats: {
    totalUsers: 0,
    newUsersThisMonth: 0,
    totalBusinesses: 0,
    verifiedBusinesses: 0,
    pendingVerifications: 0,
    activeReports: 0,
    pendingReports: 0,
  },
  userGrowth: [],
  businessCategories: [],
  reportStatus: [],
};

export const fetchAdminDashboard = async (): Promise<IAdminDashboard> => {
  const url = apiUrl("/api/v1/admin/dashboard");
  console.log("🔍 fetchAdminDashboard URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    console.log("📥 fetchAdminDashboard status:", response.status);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("❌ fetchAdminDashboard error:", response.status, errorText);
      return EMPTY_DASHBOARD;
    }

    const json = await response.json();
    console.log("📥 fetchAdminDashboard raw:", json);

    const data = json?.data ?? json;
    const statsRaw = data?.stats ?? data;

    // ---- Users ----
    const usersRaw = statsRaw?.totalUsers ?? statsRaw?.users;
    const usersObj = toObject(usersRaw);
    const totalUsers = toNumber(usersRaw, "total");
    const newUsersThisMonth = toNumber(
      usersObj.newThisMonth ?? usersRaw,
      "newThisMonth"
    );

    // ---- Businesses ----
    const businessesRaw = statsRaw?.totalBusinesses ?? statsRaw?.businesses;
    const businessesObj = toObject(businessesRaw);
    const totalBusinesses = toNumber(businessesRaw, "total");
    const verifiedBusinesses = toNumber(businessesObj.verified, "verified");

    // ---- Verifications ----
    const pendingVerifications = toNumber(
      statsRaw?.pendingVerifications ?? statsRaw?.verifications,
      "pending",
      "total"
    );

    // ---- Reports ----
    const reportsRaw = statsRaw?.activeReports ?? statsRaw?.reports;
    const reportsObj = toObject(reportsRaw);
    const activeReports = toNumber(reportsRaw, "total");
    const pendingReports = toNumber(
      reportsObj.pending ?? reportsRaw,
      "pending"
    );

    // ---- Report status pie ----
    const byStatus = toObject(reportsObj.byStatus);
    const reportStatus: IReportStatusPoint[] =
      Object.keys(byStatus).length > 0
        ? objectToPieData(byStatus)
        : [
            { name: "Pending", value: pendingReports },
            { name: "Other", value: Math.max(0, activeReports - pendingReports) },
          ].filter((p) => p.value > 0);

    // ---- Business categories pie/bar ----
    const categoriesByStatus = toObject(businessesObj.byStatus);
    const businessCategories: IBusinessCategoryPoint[] =
      Object.keys(categoriesByStatus).length > 0
        ? Object.entries(categoriesByStatus)
            .filter(([, v]) => typeof v === "number")
            .map(([category, count]) => ({
              category: category.replace(/_/g, " "),
              count: count as number,
            }))
        : [];

    // ---- User growth ----
    const userGrowth: IUserGrowthPoint[] = Array.isArray(data?.userGrowth)
      ? data.userGrowth
      : [];

    const result: IAdminDashboard = {
      stats: {
        totalUsers,
        newUsersThisMonth,
        totalBusinesses,
        verifiedBusinesses,
        pendingVerifications,
        activeReports,
        pendingReports,
      },
      userGrowth,
      businessCategories,
      reportStatus,
    };

    console.log("✅ fetchAdminDashboard normalized:", result);
    return result;
  } catch (error) {
    console.error("❌ fetchAdminDashboard exception:", error);
    return EMPTY_DASHBOARD;
  }
};