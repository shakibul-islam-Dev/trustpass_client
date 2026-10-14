import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Admin Dashboard",
  "Review TrustPass platform activity and administer businesses, products, and users.",
);

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
