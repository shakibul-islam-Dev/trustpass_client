"use client";

import {
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { ArrowLeft, LockKeyhole, Mail, RefreshCw } from "lucide-react";
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

// One shared field recipe so every control (email, password, code) has the
// same height, padding and focus ring across mobile / tablet / desktop.
const FIELD_CLASS =
  "h-11 rounded-field border-border/80 bg-background/70 pl-10 text-base shadow-xs transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15 sm:h-12 sm:text-sm";

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

  const otpInputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const focusOtpBox = (index: number) => {
    otpInputsRef.current[index]?.focus();
  };

  // Land the caret in the first code box as soon as the reset step appears.
  useEffect(() => {
    if (step === "reset" && !done) otpInputsRef.current[0]?.focus();
  }, [step, done]);

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

  // Code entry. Six single-digit boxes keep the code readable at every width
  // (the old single field used huge letter-spacing and overflowed on phones).
  const updateOtpBox = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    const chars = otp.split("");

    while (chars.length < OTP_LENGTH) chars.push("");

    if (digits.length === 0) {
      // Cleared — wipe this box and step back to the previous one.
      chars[index] = "";
      setOtp(chars.join(""));
      focusOtpBox(Math.max(0, index - 1));
      return;
    }

    // Fill this box(es), then move the caret forward.
    let pos = index;
    for (const char of digits) {
      if (pos >= OTP_LENGTH) break;
      chars[pos] = char;
      pos++;
    }

    setOtp(chars.join(""));

    if (pos < OTP_LENGTH) focusOtpBox(pos);
    else focusOtpBox(OTP_LENGTH - 1);
  };

  const handleOtpKeyDown =
    (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Backspace" && !otp[index] && index > 0) {
        event.preventDefault();
        focusOtpBox(index - 1);
      } else if (event.key === "ArrowLeft" && index > 0) {
        event.preventDefault();
        focusOtpBox(index - 1);
      } else if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
        event.preventDefault();
        focusOtpBox(index + 1);
      }
    };

  const handleOtpPaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const digits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!digits) return;

    event.preventDefault();
    setOtp(digits);
    focusOtpBox(Math.min(digits.length, OTP_LENGTH - 1));
  };

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
      size="lg"
      className="max-w-md lg:max-w-5xl"
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
          className={buttonVariants({
            className: "h-11 w-full sm:h-12",
          })}
        >
          Back to sign in
        </Link>
      ) : step === "email" ? (
        <form onSubmit={handleRequestCode} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="forgot-email">Email</Label>

            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="forgot-email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                className={cn(FIELD_CLASS, "w-full")}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="h-11 w-full justify-center gap-2 rounded-field bg-gradient-to-br from-primary to-primary-deep text-primary-foreground shadow-glow transition-shadow hover:shadow-glow-hover sm:h-12"
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? "Sending..." : "Send reset code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="reset-otp-0">Verification code</Label>

            {/* Six responsive digit boxes — same control used on the
                registration OTP step, so both flows feel identical. */}
            <div
              role="group"
              aria-label="6-digit verification code"
              className="grid grid-cols-6 gap-1.5 sm:gap-2"
              onPaste={handleOtpPaste}
            >
              {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                <input
                  key={index}
                  ref={(node) => {
                    otpInputsRef.current[index] = node;
                  }}
                  id={index === 0 ? "reset-otp-0" : undefined}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={OTP_LENGTH}
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  aria-label={`Digit ${index + 1}`}
                  placeholder="•"
                  disabled={isSubmitting}
                  value={otp[index] ?? ""}
                  onChange={(event) => updateOtpBox(index, event.target.value)}
                  onKeyDown={handleOtpKeyDown(index)}
                  onFocus={(event) => event.target.select()}
                  className="h-11 w-full min-w-0 max-w-12 justify-self-center rounded-field border border-border/80 bg-background/70 text-center text-lg font-bold text-foreground shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/35 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:text-xl"
                />
              ))}
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
                className={cn(FIELD_CLASS, "w-full")}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-confirm-password">
              Confirm new password
            </Label>

            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <PasswordInput
                id="reset-confirm-password"
                placeholder="••••••••"
                autoComplete="new-password"
                className={cn(FIELD_CLASS, "w-full")}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="h-11 w-full justify-center gap-2 rounded-field bg-gradient-to-br from-primary to-primary-deep text-primary-foreground shadow-glow transition-shadow hover:shadow-glow-hover sm:h-12"
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? "Resetting..." : "Reset password"}
          </Button>

          <div className="space-y-1.5 text-center">
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
            className="h-11 w-full justify-center gap-2 rounded-field border-border/80 bg-background/70 transition-colors hover:border-primary/30 hover:bg-surface-secondary sm:h-12"
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
