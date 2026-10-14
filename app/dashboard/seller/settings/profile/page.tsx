import ProfileManagement from "@/components/profile/ProfileManagement";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Profile Settings",
  "Manage your personal profile information on TrustPass.",
);

export default function SellerSettingsProfilePage() {
  return <ProfileManagement />;
}