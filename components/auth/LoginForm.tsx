"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LockKeyhole, Mail } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GoogleIcon, FacebookIcon } from "@/components/auth/social-icons";
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
    <AuthShell
      size="lg"
      title="Welcome back"
      subtitle="Enter your email and password to continue."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary-deep hover:underline"
            onClick={() => router.push("/auth/register")}
          >
            Sign up
          </button>
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

      <form onSubmit={handleLogin} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>

          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              className="h-12 rounded-xl border-border/80 bg-background/70 pl-10 shadow-sm transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>

          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="h-12 rounded-xl border-border/80 bg-background/70 pl-10 shadow-sm transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {/* The password reset flow lives under /auth/forgot-password. */}
          <div className="flex justify-end pt-1">
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-primary-deep hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="h-12 w-full justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-deep text-primary-foreground shadow-glow transition-all hover:-translate-y-0.5 hover:shadow-glow-hover"
          disabled={isSubmitting}
          size="lg"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>

        <div className="relative flex justify-center">
          <span className="bg-card px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
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
          className="h-12 w-full gap-2.5 rounded-xl border-border/80 bg-background/70 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-surface-secondary"
        >
          <GoogleIcon className="size-4.5 shrink-0" />
          Google
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin("facebook")}
          className="h-12 w-full gap-2.5 rounded-xl border-border/80 bg-background/70 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-surface-secondary"
        >
          <FacebookIcon className="size-4.5 shrink-0" />
          Facebook
        </Button>
      </div>
    </AuthShell>
  );
}
