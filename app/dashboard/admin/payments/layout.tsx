import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Payments",
  "Review payment activity across TrustPass.",
);

export default function PaymentsLayout({ children }: { children: ReactNode }) {
  return children;
}
