import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Trust Rules",
  "Manage the trust rules used across TrustPass.",
);

export default function TrustRulesLayout({ children }: { children: ReactNode }) {
  return children;
}
