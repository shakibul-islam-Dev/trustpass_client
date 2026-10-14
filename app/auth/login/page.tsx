import LoginForm from "@/components/auth/LoginForm";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Sign In",
  "Sign in to your TrustPass account to manage your business verification and discover trusted businesses.",
);

export default function page() {
  return <LoginForm />;
}
