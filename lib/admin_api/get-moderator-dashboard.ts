// Updated implementation for: Moderator Overview (Dashboard)
// Client-side fetch + response normalization.
// Moderator focus: verifications + reports (see Role Access Matrix).
// Developer: Aritro

import { apiUrl } from "@/lib/core/api-url";

export interface IModeratorStats {
  totalVerifications: number;
  pendingVerifications: number;
  totalReports: number;
  pendingReports: number;
}

export interface IModeratorDashboard {
  stats: IModeratorStats;
  reportStatus: { name: string; value: number }[];
  verificationStatus: { name: string; value: number }[];
}

// ============================================================
// Helpers
// ============================================================

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
    for (const key of ["total", "count", "value"]) {
      const v = obj[key];
      if (typeof v === "number" && Number.isFinite(v)) return v;
    }
  }
  return 0;
};

const toObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const toPieData = (
  obj: Record<string, unknown>
): { name: string; value: number }[] =>
  Object.entries(obj)
    .filter(([, v]) => typeof v === "number")
    .map(([name, value]) => ({
      name: name.replace(/_/g, " "),
      value: value as number,
    }));

// ============================================================
// GET /api/v1/admin/dashboard — Moderator uses same endpoint
// ============================================================
// The backend exposes /api/v1/admin/dashboard to ADMIN only, but
// moderators hit /api/v1/verifications and /api/v1/reports directly.
// We fetch those two and compute moderator-specific stats.

const EMPTY: IModeratorDashboard = {
  stats: {
    totalVerifications: 0,
    pendingVerifications: 0,
    totalReports: 0,
    pendingReports: 0,
  },
  reportStatus: [],
  verificationStatus: [],
};

export const fetchModeratorDashboard = async (): Promise<IModeratorDashboard> => {
  try {
    const [verificationsRes, reportsRes] = await Promise.all([
      fetch(apiUrl("/api/v1/verifications?limit=200"), {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: { Accept: "application/json" },
      }),
      fetch(apiUrl("/api/v1/reports?limit=200"), {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: { Accept: "application/json" },
      }),
    ]);

    const verificationsJson = verificationsRes.ok
      ? await verificationsRes.json()
      : { data: [] };
    const reportsJson = reportsRes.ok ? await reportsRes.json() : { data: [] };

    const extractArray = (json: any): any[] => {
      if (Array.isArray(json)) return json;
      if (Array.isArray(json?.data)) return json.data;
      if (Array.isArray(json?.verifications)) return json.verifications;
      if (Array.isArray(json?.reports)) return json.reports;
      if (Array.isArray(json?.data?.verifications)) return json.data.verifications;
      if (Array.isArray(json?.data?.reports)) return json.data.reports;
      return [];
    };

    const verifications = extractArray(verificationsJson);
    const reports = extractArray(reportsJson);

    // Compute verification status breakdown
    const verificationStatusMap: Record<string, number> = {};
    for (const v of verifications) {
      const status = String(v.status || "PENDING").toUpperCase();
      verificationStatusMap[status] = (verificationStatusMap[status] || 0) + 1;
    }

    // Compute report status breakdown
    const reportStatusMap: Record<string, number> = {};
    for (const r of reports) {
      const status = String(r.status || "PENDING").toUpperCase();
      reportStatusMap[status] = (reportStatusMap[status] || 0) + 1;
    }

    const result: IModeratorDashboard = {
      stats: {
        totalVerifications: verifications.length,
        pendingVerifications: verifications.filter(
          (v) =>
            String(v.status).toUpperCase() === "PENDING" ||
            String(v.status).toUpperCase() === "UNDER_REVIEW"
        ).length,
        totalReports: reports.length,
        pendingReports: reports.filter(
          (r) => String(r.status).toUpperCase() === "PENDING"
        ).length,
      },
      reportStatus: toPieData(reportStatusMap),
      verificationStatus: toPieData(verificationStatusMap),
    };

    console.log("✅ fetchModeratorDashboard:", result);
    return result;
  } catch (error) {
    console.error("❌ fetchModeratorDashboard exception:", error);
    return EMPTY;
  }
};