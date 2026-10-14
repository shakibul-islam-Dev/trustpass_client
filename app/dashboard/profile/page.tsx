import ProfileManagement from "@/components/profile/ProfileManagement";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Profile",
  "Manage your TrustPass account profile and personal information.",
);

export default function ProfilePage() {
  return <ProfileManagement />;
}