"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { safeApiMessage, safeThrownError } from "@/lib/core/api-error";
import { isApiConfigured, loginWithPassword } from "@/lib/core/auth-api";
import {
  isApiConfigured as isSessionApiConfigured,
  signInWithSocial,
} from "@/lib/core/session";

/**
 * The sign-in screen (renders at /auth/login).
 *
 * One step, no OTP: the Live API checks the email + password via
 * `POST /api/auth/sign-in/email` and answers a plain 401 when the password is
 * wrong — no OTP email is sent, so there is no "verify email" screen to fall
 * into after a failed login.
 *
 * Plain `useState` and `fetch` (through `loginWithPassword`) — readable top
 * to bottom.
 */
export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================================
  // SIGN IN  ->  POST /api/auth/sign-in/email
  // ==========================================

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Clear last round's feedback, otherwise two messages can show at once.
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isApiConfigured()) {
      setErrorMessage("API URL is not configured.");
      return;
    }

    if (!email.trim() || !password) {
      setErrorMessage("Enter your email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      // loginWithPassword never throws — failures come back on `result`.
      const result = await loginWithPassword(email, password);

      if (!result.ok) {
        setErrorMessage(result.message);
        return;
      }

      setSuccessMessage("Login successful! Redirecting...");
      // /dashboard has no page of its own: the dashboard layout reads the
      // session and sends each role to its own home. Redirecting there keeps
      // role logic out of this form.
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        safeThrownError("login", error, "Something went wrong while signing in."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // SOCIAL LOGIN  ->  handled by the Live API
  // ==========================================

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isSessionApiConfigured()) {
      setErrorMessage("API URL is not configured.");
      return;
    }

    // Navigates away to the provider on success, so there is nothing to
    // render afterwards. A `false` return means no authorize URL came back.
    const redirected = await signInWithSocial(provider, "/");

    if (!redirected) {
      setErrorMessage(
        safeApiMessage({
          fallback: `Could not start ${provider} sign-in. Please try again.`,
        }),
      );
    }
  };

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

        <form onSubmit={handleLogin} className="space-y-4" noValidate>
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
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {/* The password reset flow lives under /auth/forgot-password. */}
          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium text-slate-900 underline-offset-4 hover:underline dark:text-white"
            >
              Forgot password?
            </Link>
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
      </div>
    </div>
  );
}