import type { Metadata } from "next";
import type { ReactNode } from "react";

import DashboardLayoutClient from "@/components/dashboard/DashboardLayoutClient";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | TrustPass",
  },
  description: "Access your TrustPass dashboard and manage your account activity.",
  openGraph: {
    title: "Dashboard | TrustPass",
    description: "Access your TrustPass dashboard and manage your account activity.",
    siteName: "TrustPass",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Dashboard | TrustPass",
    description: "Access your TrustPass dashboard and manage your account activity.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
