import ForgotPasswordForm from "@/components/password/ForgotPasswordForm";

/**
 * `/auth/forgot-password` — step 1 of password reset.
 *
 * No Suspense needed here: `ForgotPasswordForm` does not read search params,
 * so nothing in this page requires a client-side boundary.
 */
export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}