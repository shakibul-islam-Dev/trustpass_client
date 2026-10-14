import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Notifications",
  "Send and review TrustPass platform notifications.",
);

export default function NotificationsLayout({ children }: { children: ReactNode }) {
  return children;
}
