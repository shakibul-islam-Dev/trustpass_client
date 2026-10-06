"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import OtpForm from "@/components/otp/OtpForm";
import { readApiError, safeApiMessage, safeThrownError } from "@/lib/core/api-error";
import {
  isApiConfigured,
  loginWithPassword,
  resendOtp,
  verifyOtp,
} from "@/lib/core/auth-api";
import {
  isApiConfigured as isSessionApiConfigured,
  signInWithSocial,
} from "@/lib/core/session";
import { homeForRole, type ApiRole } from "@/lib/core/roles";

type Inputs = {
  email: string;
  password: string;
};



export default function LoginForm() {
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Non-null while step 2 is showing. Holds the address to verify, so the
  // field the user typed is the one that gets verified even if they cannot
  // edit it here.
  const [pendingVerificationEmail, setPendingVerificationEmail] =
    useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Inputs>({
    mode: "onSubmit",
  });

  // ==========================================
  // SIGN IN  ->  POST /api/v1/auth/login
  // The server authenticates with email + password
  // and sets the session cookie.
  // ==========================================

  const handleLogin: SubmitHandler<Inputs> = async (formData) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setNotice(null);

    if (!isApiConfigured()) {
      setErrorMessage("API URL is not configured.");
      return;
    }

    try {
      const result = await loginWithPassword(formData.email, formData.password);

      if (result.ok) {
        setSuccessMessage("Login successful! Redirecting...");
        // Send each role to its own dashboard straight away. The /dashboard
        // page would bounce here anyway; doing it here just saves a round trip.
        router.replace(homeForRole(result.user?.role as ApiRole | undefined));
        router.refresh();
        return;
      }

      // The address exists and the password matched, but it is not verified.
      // Move to step 2 instead of showing a dead end.
      if (result.needsVerification) {
        setPendingVerificationEmail(formData.email.trim().toLowerCase());
        setNotice(
          "This email address is not verified yet. Enter the 6-digit code we " +
            "sent to finish signing in.",
        );
        return;
      }

      setErrorMessage(
        await readApiError("login", result.response, "Failed to log in."),
      );
    } catch (error) {
      setErrorMessage(
        safeThrownError("login", error, "Something went wrong while signing in."),
      );
    }
  };

  // ==========================================
  // VERIFY OTP  ->  POST /api/v1/auth/verify-otp
  //
  // The server forwards its own Set-Cookie here, so a successful verification
  // normally signs the user in. If it did not, fall back to the password
  // screen rather than pushing them into a dashboard they cannot load.
  // ==========================================

  const handleVerifyOtp = async (otp: string) => {
    if (!pendingVerificationEmail) return;

    setIsVerifying(true);
    setErrorMessage(null);
    setNotice(null);

    try {
      const result = await verifyOtp(pendingVerificationEmail, otp);

      if (!result.ok) {
        setErrorMessage(
          result.invalidCode
            ? "That code is not right or has expired. Request a new one below."
            : await readApiError(
                "verify-otp",
                result.response,
                "Could not verify that code.",
              ),
        );
        return;
      }

      // A correct code both verifies the address and signs the user in, so they can
      // go straight to their dashboard.
      setSuccessMessage("Email verified. Redirecting...");
      router.replace(homeForRole(result.user?.role as ApiRole | undefined));
      router.refresh();
    } catch (error) {
      setErrorMessage(
        safeThrownError("verify-otp", error, "Could not verify that code."),
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!pendingVerificationEmail) return;

    setIsResending(true);
    setErrorMessage(null);
    setNotice(null);

    try {
      const response = await resendOtp(pendingVerificationEmail);

      if (!response.ok) {
        setErrorMessage(
          await readApiError(
            "resend-otp",
            response,
            "Could not send a new code. Try again in a moment.",
          ),
        );
        return;
      }

      setNotice("If that account is still unverified, a new code is on its way.");
    } catch (error) {
      setErrorMessage(
        safeThrownError("resend-otp", error, "Could not send a new code."),
      );
    } finally {
      setIsResending(false);
    }
  };

  // ==========================================
  // SOCIAL LOGIN  ->  handled by the server
  // ==========================================

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isSessionApiConfigured()) {
      setErrorMessage("API URL is not configured.");
      return;
    }

    // Navigates away to the provider on success, so there is nothing to render
    // afterwards. A `false` return means no authorize URL came back.
    const redirected = await signInWithSocial(provider, "/");

    if (!redirected) {
      setErrorMessage(
        safeApiMessage({
          fallback: `Could not start ${provider} sign-in. Please try again.`,
        }),
      );
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {pendingVerificationEmail ? "Verify your email" : "Sign In"}
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {pendingVerificationEmail
              ? "Enter the code we emailed you to finish signing in."
              : "Enter your email and password to continue."}
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

        {/* Neutral notice (e.g. "code sent", "check your inbox") */}
        {notice && !errorMessage && (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
            {notice}
          </div>
        )}

        {pendingVerificationEmail ? (
          <>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Code sent to{" "}
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {pendingVerificationEmail}
              </span>
            </p>

            <OtpForm
              email={pendingVerificationEmail}
              isVerifying={isVerifying}
              onVerify={handleVerifyOtp}
              onResend={handleResendOtp}
              isResending={isResending}
              onBack={() => {
                setPendingVerificationEmail(null);
                setErrorMessage(null);
                setNotice(null);
              }}
              backButtonText="Use a different account"
            />
          </>
        ) : (
          <>
        <form onSubmit={handleSubmit(handleLogin)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-950 dark:border-slate-700 dark:focus:ring-slate-300"
              {...register("email")}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-950 dark:border-slate-700 dark:focus:ring-slate-300"
              {...register("password")}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>

          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500 dark:bg-slate-900">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialLogin("google")}
            className="w-full"
          >
            Google
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialLogin("facebook")}
            className="w-full"
          >
            Facebook
          </Button>
        </div>

        {/* Link to the sign-up form, so someone without an account is not
            stranded here. */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            className="font-medium text-slate-900 underline-offset-4 hover:underline dark:text-white"
            onClick={() => router.push("/auth/register")}
          >
            Sign up
          </button>
        </p>
          </>
        )}
      </div>
    </div>
  );
}
