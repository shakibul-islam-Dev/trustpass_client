import { Suspense } from "react";
import ResetPasswordForm from "@/components/password/ResetPasswordForm";

/**
 * `/auth/reset-password` — password reset.
 *
 * Opened from the link in the reset email: the Live API emails a one-time
 * link that arrives here as `?token=...`. `ResetPasswordForm` posts that
 * token plus the new password to `POST /api/auth/reset-password`.
 *
 * The Suspense boundary is required, not decoration: `ResetPasswordForm`
 * calls `useSearchParams()`, and Next refuses to prerender a page that reads
 * search params without a boundary above it
 * ("useSearchParams() should be wrapped in a suspense boundary").
 */
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[80vh] items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}