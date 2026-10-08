"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
    <AuthShell
      title="Forgot password?"
      subtitle="Enter the email you signed up with, and we will email you a link to reset your password."
      footer={
        !successMessage && (
          <p className="text-center text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary-deep hover:underline"
            >
              Back to sign in
            </Link>
          </p>
        )
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

      {!successMessage ? (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="forgot-email">Email</Label>

            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="forgot-email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                className="h-11 rounded-xl border-border/80 bg-background/70 pl-10 shadow-sm transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="h-11 w-full justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-deep text-primary-foreground shadow-glow transition-shadow hover:shadow-glow-hover"
            disabled={isSubmitting}
            size="lg"
          >
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
    </AuthShell>
  );
}
