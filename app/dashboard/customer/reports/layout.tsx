import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "My Reports",
  "Track reports you have submitted through TrustPass.",
);

export default function ReportsLayout({ children }: { children: ReactNode }) {
  return children;
}
