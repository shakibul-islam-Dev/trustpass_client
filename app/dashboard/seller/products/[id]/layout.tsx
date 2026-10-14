import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Product Details",
  "View and update a product in your TrustPass seller catalog.",
);

export default function ProductDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
