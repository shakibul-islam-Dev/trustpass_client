import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Reports Review",
  "Review reports submitted to the TrustPass moderation team.",
);

export default function ReportsLayout({ children }: { children: ReactNode }) {
  return children;
}
