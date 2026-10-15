import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Notifications",
  "Review notifications for your TrustPass account.",
);

export default function NotificationsLayout({ children }: { children: ReactNode }) {
  return children;
}
