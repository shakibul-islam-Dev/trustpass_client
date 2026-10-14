import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Moderator Dashboard",
  "Review TrustPass verification requests and reports.",
);

export default function ModeratorLayout({ children }: { children: ReactNode }) {
  return children;
}
