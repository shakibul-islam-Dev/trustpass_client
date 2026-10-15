import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Products",
  "Review product listings across TrustPass.",
);

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return children;
}
