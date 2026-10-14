import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Reports",
  "Review and manage reports submitted to TrustPass.",
);

export default function ReportsLayout({ children }: { children: ReactNode }) {
  return children;
}
