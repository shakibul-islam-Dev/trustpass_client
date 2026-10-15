import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "User Management",
  "Manage user accounts and access on TrustPass.",
);

export default function UserManagementLayout({ children }: { children: ReactNode }) {
  return children;
}
