"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, LockKeyhole, Mail, RefreshCw } from "lucide-react";
import { cn } from "cn";
import { toast } from "sonner";
import AuthShell from "@/components/auth/AuthShell";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isApiConfigured, normalizeEmail } from "@/lib/core/auth-api";
import {
  requestPasswordResetOtp,
  resetPasswordWithOtp,
} from "@/lib/core/password-api";
import { readApiError } from "@/lib/core/api-error";

/**
 * "Forgot password?" — a TWO-STEP email-OTP reset.
 *
 *   /auth/forgot-password
 *
 * Step 1 asks for the address and requests a 6-digit code:
 *   POST /api/auth/email-otp/request-password-reset  { email }
 * Step 2 collects the code + a new password and sets it in one call:
 *   POST /api/auth/email-otp/reset-password          { email, otp, password }
 *
 * This deliberately does NOT use the link flow
 * (`/api/auth/request-password-reset` + `/api/auth/reset-password`). The Live
 * API answers that with `RESET_PASSWORD_DISABLED` (it has no
 * `sendResetPassword` callback), so a link can never reach the user. The
 * `emailOTP` plugin IS enabled, so the code flow below is the one that works.
 *
 * The server answers success for known AND unknown addresses at step 1, so the
 * success notice is deliberately vague — this screen can never reveal whether
 * an address has an account.
 */
const MIN_PASSWORD_LENGTH = 8;
const OTP_LENGTH = 6;

const FIELD_CLASS =
  "h-11 rounded-xl border-border/80 bg-background/70 pl-10 shadow-sm transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10";

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [done, setDone] = useState(false);

  /** Requests a reset code. Never throws; reports its own errors. */
  const sendCode = async (address: string): Promise<boolean> => {
    if (!isApiConfigured()) {
      setErrorMessage("API URL is not configured.");
      toast.error("API URL is not configured.");
      return false;
    }

    const response = await requestPasswordResetOtp(address);

    if (!response.ok) {
      const message = await readApiError(
        "request-password-reset-otp",
        response,
        "Could not send the code. Please try again in a moment.",
      );
      setErrorMessage(message);
      toast.error(message);
      return false;
    }

    return true;
  };

  // ============================================================
  // Step 1 — request the code
  // ============================================================

  const handleRequestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage(null);
    setNotice(null);

    const address = normalizeEmail(email);

    if (!address) {
      setErrorMessage("Enter your email address first.");
      toast.error("Enter your email address first.");
      return;
    }

    setIsSubmitting(true);
    const ok = await sendCode(address);
    setIsSubmitting(false);

    if (!ok) return;

    setEmail(address);
    setStep("reset");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setNotice(
      "If an account exists for that email, a 6-digit code is on its way. " +
        "Enter it below with your new password.",
    );
    toast.success("If that account exists, a reset code is on its way.");
  };

  const handleResend = async () => {
    setErrorMessage(null);
    setIsResending(true);
    const ok = await sendCode(email);
    setIsResending(false);

    if (!ok) return;

    setNotice("A new code is on its way.");
    toast.success("A new code is on its way.");
  };

  // ============================================================
  // Step 2 — code + new password
  // ============================================================

  const handleReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage(null);
    setNotice(null);

    if (otp.length !== OTP_LENGTH) {
      const message = `Enter the ${OTP_LENGTH}-digit code from your email.`;
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      const message = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    if (newPassword !== confirmPassword) {
      const message = "The two passwords do not match.";
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    setIsSubmitting(true);

    const result = await resetPasswordWithOtp({
      email,
      otp,
      password: newPassword,
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setErrorMessage(result.message);
      toast.error(result.message);
      return;
    }

    setDone(true);
    setNotice("Your password has been reset. You can sign in with it now.");
    toast.success("Password reset. You can sign in now.");
  };

  return (
    <AuthShell
      title={
        done
          ? "Password reset"
          : step === "reset"
            ? "Enter your code"
            : "Forgot password?"
      }
      subtitle={
        done
          ? "Your password has been changed."
          : step === "reset"
            ? `Enter the 6-digit code sent to ${email} and choose a new password.`
            : "Enter the email you signed up with and we'll send you a reset code."
      }
      footer={
        !done && (
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

      {/* Neutral notice (code sent / password reset) */}
      {notice && !errorMessage && (
        <Alert className="border-success/30 bg-success-soft text-success shadow-surface">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}

      {done ? (
        <Link
          href="/auth/login"
          className={buttonVariants({ className: "w-full" })}
        >
          Back to sign in
        </Link>
      ) : step === "email" ? (
        <form onSubmit={handleRequestCode} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="forgot-email">Email</Label>

            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="forgot-email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                className={FIELD_CLASS}
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
            {isSubmitting ? "Sending..." : "Send reset code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="reset-otp">Verification code</Label>

            <div className="relative">
              <KeyRound className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="reset-otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={OTP_LENGTH}
                className="h-11 rounded-xl border-border/80 bg-background/70 pl-10 text-center text-lg font-semibold tracking-[0.5em] shadow-sm transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
                value={otp}
                onChange={(event) =>
                  setOtp(
                    event.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH),
                  )
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-new-password">New password</Label>

            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <PasswordInput
                id="reset-new-password"
                placeholder="••••••••"
                autoComplete="new-password"
                className={FIELD_CLASS}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-confirm-password">Confirm new password</Label>

            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <PasswordInput
                id="reset-confirm-password"
                placeholder="••••••••"
                autoComplete="new-password"
                className={FIELD_CLASS}
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
            {isSubmitting ? "Resetting..." : "Reset password"}
          </Button>

          <div className="space-y-2 text-center">
            <p className="text-xs text-muted-foreground">
              Didn&apos;t receive the code?
            </p>
            <button
              type="button"
              onClick={() => void handleResend()}
              disabled={isSubmitting || isResending}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-primary-deep hover:underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={cn("size-3.5", isResending && "animate-spin")}
              />
              {isResending ? "Sending..." : "Resend code"}
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-11 w-full justify-center gap-2 rounded-xl border-border/80 bg-background/70 transition-colors hover:border-primary/30 hover:bg-surface-secondary"
            onClick={() => {
              setStep("email");
              setNotice(null);
              setErrorMessage(null);
              setOtp("");
              setNewPassword("");
              setConfirmPassword("");
            }}
            disabled={isSubmitting}
          >
            <ArrowLeft className="size-4" />
            Use a different email
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
