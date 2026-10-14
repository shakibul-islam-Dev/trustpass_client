import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Customer Dashboard",
  "Manage your TrustPass activity, reports, and notifications.",
);

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return children;
}
