import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Verification Queue",
  "Review business verification requests assigned to TrustPass moderators.",
);

export default function VerificationQueueLayout({ children }: { children: ReactNode }) {
  return children;
}
