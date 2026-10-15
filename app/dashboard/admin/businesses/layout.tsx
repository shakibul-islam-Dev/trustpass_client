import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Businesses",
  "Review and manage business accounts on TrustPass.",
);

export default function BusinessesLayout({ children }: { children: ReactNode }) {
  return children;
}
