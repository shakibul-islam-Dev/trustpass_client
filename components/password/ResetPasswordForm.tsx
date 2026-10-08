"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { isApiConfigured } from "@/lib/core/auth-api";
import { resetPassword } from "@/lib/core/password-api";

/**
 * Same floor the server applies (better-auth `minPasswordLength`), checked
 * here only so the user gets the answer without a round trip. The server
 * still decides in the end.
 */
const MIN_PASSWORD_LENGTH = 8;

/**
 * The screen the "reset your password" email link opens:
 *
 *   /auth/reset-password?token=XXXX
 *
 * The token comes from the URL, so this works signed out and knows nothing
 * about the user until the server says who the token belongs to.
 *
 * Plain `useState` instead of react-hook-form on purpose — there are two
 * fields and one submit, and a junior reader can follow this top to bottom.
 */
export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Clear last round's feedback, otherwise two messages can show at once.
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("The two passwords do not match.");
      return;
    }

    if (!isApiConfigured()) {
      setErrorMessage("API URL is not configured.");
      return;
    }

    // The form is only rendered when a token exists, but a guard beats a cast.
    if (!token) {
      setErrorMessage("This reset link is not valid.");
      return;
    }

    setIsSubmitting(true);

    // resetPassword never throws — failures come back on `result`.
    const result = await resetPassword({ token, newPassword });

    setIsSubmitting(false);

    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }

    // The token is spent now; the form must not stay usable.
    setSuccessMessage("Your password has been reset. You can sign in with it now.");
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Reset your password
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Choose a new password for your account.
          </p>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-center text-sm text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400">
            {successMessage}
          </div>
        )}

        {!token ? (
          /* The link was opened without a token — wrong URL, or the email
             rewrote it. Say so instead of showing a form that can never work. */
          <div className="space-y-4 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              This reset link is not valid. Request a new one from the
              &quot;Forgot password?&quot; option, or ask for the email again.
            </p>

            {/* `buttonVariants` styles a Link with the button look. Button
                itself cannot render a Link — no asChild in this codebase. */}
            <Link
              href="/auth/login"
              className={buttonVariants({ variant: "outline", className: "w-full" })}
            >
              Back to sign in
            </Link>
          </div>
        ) : successMessage ? (
          <div className="space-y-4">
            <Link
              href="/auth/login"
              className={buttonVariants({ className: "w-full" })}
            >
              Sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label
                htmlFor="new-password"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                New password
              </label>

              <input
                id="new-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-950 dark:border-slate-700 dark:focus:ring-slate-300"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirm-password"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Confirm new password
              </label>

              <input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-950 dark:border-slate-700 dark:focus:ring-slate-300"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Reset password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
