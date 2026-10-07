import ChangePasswordForm from "@/components/password/ChangePasswordForm";

/**
 * `/dashboard/change-password` — open to every signed-in role
 * (see the `change-password` rule in `lib/core/roles.ts`).
 *
 * The dashboard layout above this page already gates on the session, and the
 * API gates again on its own. This page only renders the form.
 */
export default function ChangePasswordPage() {
  return <ChangePasswordForm />;
}
