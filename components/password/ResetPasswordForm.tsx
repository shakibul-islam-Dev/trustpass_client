"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
    <AuthShell
      title="Reset your password"
      subtitle="Choose a new password for your account."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Need a fresh link?{" "}
          <Link
            href="/auth/forgot-password"
            className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary-deep hover:underline"
          >
            Request one
          </Link>
        </p>
      }
    >
      {/* Error */}
      {errorMessage && (
        <Alert variant="destructive" className="shadow-surface">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Success */}
      {successMessage && (
        <Alert className="border-success/30 bg-success-soft text-success shadow-surface">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {!token ? (
        /* The link was opened without a token — wrong URL, or the email
           rewrote it. Say so instead of showing a form that can never work. */
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
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
            <Label htmlFor="new-password">New password</Label>

            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className="h-11 rounded-xl border-border/80 bg-background/70 pl-10 shadow-sm transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>

            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className="h-11 rounded-xl border-border/80 bg-background/70 pl-10 shadow-sm transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="h-11 w-full justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-deep text-primary-foreground shadow-glow transition-shadow hover:shadow-glow-hover"
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? "Saving..." : "Reset password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
