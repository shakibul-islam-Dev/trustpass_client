"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { isApiConfigured } from "@/lib/core/auth-api";
import { changePassword } from "@/lib/core/password-api";

/** Same floor the server applies (better-auth `minPasswordLength`). */
const MIN_PASSWORD_LENGTH = 8;

/**
 * The signed-in "change my password" form (renders at
 * `/dashboard/change-password`).
 *
 * The server, not this form, decides whether the user is signed in — the
 * session cookie rides along with the request (`credentials: "include"`).
 * If it is missing or expired the API answers 401 and the message below
 * points at the sign-in screen.
 *
 * Plain `useState` instead of react-hook-form on purpose: three fields, one
 * checkbox, one submit — a junior reader can follow this top to bottom.
 */
export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Checked by default: after a password change the other devices are the
  // ones a user usually wants gone.
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // True only after the server answered 401 — drives the sign-in link below.
  const [sessionExpired, setSessionExpired] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Clear last round's feedback, otherwise two messages can show at once.
    setErrorMessage(null);
    setSuccessMessage(null);
    setSessionExpired(false);

    if (!currentPassword) {
      setErrorMessage("Enter your current password.");
      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("The two passwords do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage("The new password must be different from the current one.");
      return;
    }

    if (!isApiConfigured()) {
      setErrorMessage("API URL is not configured.");
      return;
    }

    setIsSubmitting(true);

    // changePassword never throws — failures come back on `result`.
    const result = await changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions,
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setSessionExpired(result.status === 401);
      setErrorMessage(result.message);
      return;
    }

    setSuccessMessage(
      revokeOtherSessions
        ? "Password changed. Your other devices have been signed out."
        : "Password changed.",
    );

    // Wipe the fields so a stale password cannot be resubmitted by accident.
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Change password
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Use your current password to set a new one.
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

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <label
              htmlFor="current-password"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Current password
            </label>

            <input
              id="current-password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-950 dark:border-slate-700 dark:focus:ring-slate-300"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="change-new-password"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              New password
            </label>

            <input
              id="change-new-password"
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
              htmlFor="change-confirm-password"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Confirm new password
            </label>

            <input
              id="change-confirm-password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-950 dark:border-slate-700 dark:focus:ring-slate-300"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          <label
            htmlFor="revoke-other-sessions"
            className="flex cursor-pointer items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
          >
            <input
              id="revoke-other-sessions"
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-slate-900 dark:accent-slate-100"
              checked={revokeOtherSessions}
              onChange={(event) => setRevokeOtherSessions(event.target.checked)}
            />

            <span>Sign out my other devices after changing it.</span>
          </label>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Change password"}
          </Button>
        </form>

        {/* Shown only after the API answered 401 (see `sessionExpired`). */}
        {sessionExpired && (
          <Link
            href="/auth/login"
            className={buttonVariants({ variant: "outline", className: "w-full" })}
          >
            Back to sign in
          </Link>
        )}
      </div>
    </div>
  );
}
