import ForgotPasswordForm from "@/components/password/ForgotPasswordForm";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Reset Password",
  "Request a secure password reset for your TrustPass account.",
);

/**
 * `/auth/forgot-password` — step 1 of password reset.
 *
 * No Suspense needed here: `ForgotPasswordForm` does not read search params,
 * so nothing in this page requires a client-side boundary.
 */
export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}