"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { isApiConfigured } from "@/lib/core/auth-api";
import { requestPasswordReset } from "@/lib/core/password-api";
import { readApiError } from "@/lib/core/api-error";

/**
 * Step 1 of "Forgot password?" — ask for the address.
 *
 *   /auth/forgot-password
 *
 * Sends the address to the Live API's `POST /api/auth/request-password-reset`
 * (`redirectTo` points at this app's own reset page, so the emailed link opens
 * `/auth/reset-password?token=...`, which step 2 — `ResetPasswordForm` — uses).
 * The email itself is sent by the Live API; this app never sends mail.
 *
 * The server answers success for BOTH known and unknown addresses, so this
 * form can never reveal whether an address has an account — the success
 * message is deliberately vague ("if an account exists...").
 *
 * Plain `useState`, one field, one button — readable top to bottom.
 */
export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Clear last round's feedback.
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage("Enter your email address first.");
      return;
    }

    if (!isApiConfigured()) {
      setErrorMessage("API URL is not configured.");
      return;
    }

    setIsSubmitting(true);

    // requestPasswordReset never throws — the response is all there is.
    // `redirectTo` is where the reset link in the email points back to:
    // this app's own reset page, on whatever origin it is being served from.
    const response = await requestPasswordReset({
      email: email.trim().toLowerCase(),
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    setIsSubmitting(false);

    if (!response.ok) {
      // readApiError shows the Live API's own message when it has one (for
      // example "Reset password isn't enabled").
      setErrorMessage(
        await readApiError(
          "request-password-reset",
          response,
          "Could not send the reset email. Please try again.",
        ),
      );
      return;
    }

    setSuccessMessage(
      "If an account exists for that email, a password reset link is on its way. Please check your inbox.",
    );
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Forgot password?
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter the email you signed up with and we will email you a link to
            reset your password.
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

        {!successMessage ? (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label
                htmlFor="forgot-email"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Email
              </label>

              <input
                id="forgot-email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-950 dark:border-slate-700 dark:focus:ring-slate-300"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        ) : (
          /* Once the email is on its way there is nothing left to type on this
             page — just send the user back. The link in the email is the path
             forward now. */
          <Link
            href="/auth/login"
            className={buttonVariants({ className: "w-full" })}
          >
            Back to sign in
          </Link>
        )}

        {/* Escape hatch back to plain sign-in. */}
        {!successMessage && (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Remembered it?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-slate-900 underline-offset-4 hover:underline dark:text-white"
            >
              Back to sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}