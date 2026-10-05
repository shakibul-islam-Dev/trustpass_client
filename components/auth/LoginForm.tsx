"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { safeApiMessage, safeThrownError } from "@/lib/core/api-error";
import { isApiConfigured, loginWithPassword } from "@/lib/core/auth-api";
import {
  isApiConfigured as isSessionApiConfigured,
  signInWithSocial,
} from "@/lib/core/session";

type Inputs = {
  email: string;
  password: string;
};

/*
 * OTP SIGN-IN IS COMMENTED OUT
 *
 * This form used to have a second "otp" step: a 403 from login sent the user to
 * an OTP input, and resend-otp / verify-otp were called from here. Both are
 * commented out in `lib/core/auth-api.ts`, so there is no OTP step and this is
 * now a single-screen credentials form.
 *
 * What a 403 means with OTP off:
 *
 * The server checks the account's `emailVerified` flag before signing in, and
 * its mail transport is unconfigured, so an address can never be verified. A
 * 403 here therefore means the account cannot be signed in from this screen —
 * there is no code to enter. The message below says that rather than implying
 * a code was sent.
 */

export default function LoginForm() {
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
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

    if (!isApiConfigured()) {
      setErrorMessage("API URL is not configured.");
      return;
    }

    try {
      const result = await loginWithPassword(formData.email, formData.password);

      if (result.ok) {
        setSuccessMessage("Login successful! Redirecting...");
        router.push("/");
        router.refresh();
        return;
      }

      // 403 = the server has `requireEmailVerification: true` and this address
      // is not verified. With OTP disabled there is no way to satisfy that from
      // here, so say exactly that rather than implying a code is on its way.
      if (result.needsVerification) {
        setErrorMessage(
          safeApiMessage({
            status: result.status,
            serverMessage: result.serverMessage,
            fallback:
              "This email address is not verified. Email verification is " +
              "currently unavailable, so this account cannot sign in yet.",
          }),
        );
        return;
      }

      setErrorMessage(
        safeApiMessage({
          status: result.status,
          serverMessage: result.serverMessage,
          fallback: "Failed to log in.",
        }),
      );
    } catch (error) {
      setErrorMessage(
        safeThrownError("login", error, "Something went wrong while signing in."),
      );
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
            Sign In
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter your email and password to continue.
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

        <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
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
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />

            {errors.email && (
              <p className="text-sm font-medium text-red-500">
                {errors.email.message}
              </p>
            )}
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
              {...register("password", {
                required: "Password is required",
              })}
            />

            {errors.password && (
              <p className="text-sm font-medium text-red-500">
                {errors.password.message}
              </p>
            )}
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
      </div>
    </div>
  );
}
