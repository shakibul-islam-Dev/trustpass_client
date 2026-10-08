"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { LockKeyhole, Mail, Phone, ShoppingBag, Store, UserRound } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GoogleIcon, FacebookIcon } from "@/components/auth/social-icons";
import { readApiError, safeApiMessage, safeThrownError } from "@/lib/core/api-error";
import {
  isApiConfigured,
  normalizeEmail,
  registerAccount,
  resendOtp,
  verifyOtp,
} from "@/lib/core/auth-api";
import { signInWithSocial } from "@/lib/core/session";
import { homeForRole, type ApiRole } from "@/lib/core/roles";
import OtpForm from "@/components/otp/OtpForm";

/*
 * TWO-STEP REGISTRATION
 *
 * Step 1 creates the account. The server runs better-auth with
 * `requireEmailVerification: true`, so the account exists but cannot sign in
 * until it is verified — which makes step 2 mandatory, not decorative.
 *
 * The server answers 201 either way, so a 201 means "the account exists" and
 * nothing more: whether the mail actually left is not something this client
 * can observe. The OTP screen offers a resend regardless, which is the only
 * recovery if the first send was lost.
 *
 * `verify-otp` normally signs the user in as well, because the server forwards
 * better-auth's Set-Cookie. If it does not, the user is sent to the login page
 * rather than into a dashboard they cannot load.
 */

interface InputForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  // Only the two self-service roles. The server's schema also accepts
  // MODERATOR and ADMIN, which would let anyone make themselves an admin.
  role: "CUSTOMER" | "SELLER";
}

export default function RegistrationForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const router = useRouter();

  // Non-null once the account exists and the OTP step is showing.
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // True after the server answers 409, so the form can offer a way to sign in
  // instead of leaving a dead end.
  const [emailTaken, setEmailTaken] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<InputForm>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "CUSTOMER",
    },
    shouldUnregister: false,
  });

  // ============================================================
  // Step 1 — Registration
  // ============================================================

  const onSubmit: SubmitHandler<InputForm> = async (formData) => {
    setErrorMessage(null);
    setNotice(null);
    setEmailTaken(false);

    if (!isApiConfigured()) {
      setErrorMessage("API URL is not configured.");
      return;
    }

    const name = formData.name.trim();
    const email = normalizeEmail(formData.email);
    const password = formData.password;
    const phone = formData.phone.trim();

    try {
      // The external server owns user creation. Do NOT also call
      // authClient.signUp.email() here — that used to create a second,
      // locally-owned user record and win the session cookie.
      const response = await registerAccount({
        name,
        email,
        password,
        phone: phone || undefined,
        role: formData.role,
      });

      if (!response.ok) {
        // 409 means the address is already on file.
        //
        // This used to call router.push("/auth/login") straight away, which
        // threw away the explanation before anyone could read it — the alert
        // flashed and vanished. It is now shown, with a button to carry on to
        // sign in.
        if (response.status === 409) {
          setEmailTaken(true);
          setErrorMessage(
            "That email already has an account. Try signing in instead, or use " +
              "a different email address.",
          );
          return;
        }

        setEmailTaken(false);
        setErrorMessage(
          await readApiError(
            "register",
            response,
            "Registration could not be completed.",
          ),
        );
        return;
      }

      const body = await response.clone().json().catch(() => null);

      if (!body?.success) {
        setErrorMessage(
          safeApiMessage({
            status: response.status,
            fallback: "Registration could not be completed.",
          }),
        );
        return;
      }

      // The account exists but cannot sign in until it is verified, so go
      // straight to the OTP step rather than bouncing to login.
      setOtpEmail(email);
      setNotice(
        "Account created. Enter the 6-digit code we sent to your email to " +
          "finish setting up your account.",
      );
    } catch (error: unknown) {
      setErrorMessage(
        safeThrownError(
          "register",
          error,
          "Something went wrong while registering.",
        ),
      );
    }
  };

  // ============================================================
  // Step 2 — OTP Verification
  // ============================================================

  const handleVerifyOtp = async (otp: string) => {
    if (!otpEmail) return;

    setIsVerifying(true);
    setErrorMessage(null);
    setNotice(null);

    try {
      const result = await verifyOtp(otpEmail, otp);

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

      // A correct code verifies the address AND signs the user in, so there is no
      // need to ask for the password again.
      setNotice("Email verified. Taking you to your dashboard...");
      router.replace(homeForRole(result.user?.role as ApiRole | undefined));
      router.refresh();
    } catch (error: unknown) {
      setErrorMessage(
        safeThrownError(
          "verify-otp",
          error,
          "Could not verify that code.",
        ),
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!otpEmail) return;

    setIsResending(true);
    setErrorMessage(null);
    setNotice(null);

    try {
      const response = await resendOtp(otpEmail);

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

      setNotice(
        "If that account is still unverified, a new code is on its way.",
      );
    } catch (error: unknown) {
      setErrorMessage(
        safeThrownError("resend-otp", error, "Could not send a new code."),
      );
    } finally {
      setIsResending(false);
    }
  };

  // ============================================================
  // Social Login -> handled entirely by the API server
  // ============================================================

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    setErrorMessage(null);

    // On success the browser has already been sent to the provider, so there is
    // nothing left to render. Only a failure reaches the message below.
    const redirected = await signInWithSocial(provider, "/");

    if (!redirected) {
      setErrorMessage(
        safeApiMessage({
          fallback: `Could not start ${provider} sign-in. Please try again.`,
        }),
      );
    }
  };

  const handleGoogleLogin = () => handleSocialLogin("google");
  const handleFacebookLogin = () => handleSocialLogin("facebook");

  // ============================================================
  // UI
  // ============================================================

 return (
    <AuthShell
      size="lg"
      title={otpEmail ? "Check your inbox" : "Create your account"}
      subtitle={
        otpEmail
          ? "We sent a 6-digit code to your email. Enter it below to verify your account and finish signing up."
          : "Join TrustPass and start buying & selling with confidence."
      }
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary-deep hover:underline"
            onClick={() => router.push("/auth/login")}
          >
            Sign in
          </button>
        </p>
      }
    >
      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive" className="shadow-surface">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Shown only after a 409. Puts the one useful next step right under
          the message instead of silently redirecting away from it. */}
      {emailTaken && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => router.push("/auth/login")}
        >
          Go to sign in
        </Button>
      )}

      {/* Neutral notice (e.g. "code sent") */}
      {notice && !errorMessage && (
        <Alert className="border-success/30 bg-success-soft text-success shadow-surface">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}

      {/* ====================================================
           OTP step — replaces the form once the account exists.
      ==================================================== */}
      {otpEmail ? (
        <div className="space-y-5">
          <p className="text-center text-sm text-muted-foreground">
            Code sent to{" "}
            <span className="font-medium text-foreground">{otpEmail}</span>
          </p>

          <OtpForm
            email={otpEmail}
            isVerifying={isVerifying}
            onVerify={handleVerifyOtp}
            onResend={handleResendOtp}
            isResending={isResending}
            onBack={() => {
              setOtpEmail(null);
              setNotice(null);
              setErrorMessage(null);
            }}
            backButtonText="Back to sign up"
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                className="h-12 rounded-xl border-border/80 bg-background/70 pl-10 shadow-sm transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
                {...register("name")}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="john@example.com"
                className="h-12 rounded-xl border-border/80 bg-background/70 pl-10 shadow-sm transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
                {...register("email")}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className="h-12 rounded-xl border-border/80 bg-background/70 pl-10 shadow-sm transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
                {...register("password")}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <div className="relative">
              <Phone className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                type="text"
                autoComplete="tel"
                placeholder="+8801712345678"
                className="h-12 rounded-xl border-border/80 bg-background/70 pl-10 shadow-sm transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
                {...register("phone")}
              />
            </div>
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label>Account Type</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2"
                >
                  {[
                    {
                      value: "CUSTOMER",
                      label: "Customer",
                      icon: ShoppingBag,
                      description: "Buy from businesses you can trust",
                    },
                    {
                      value: "SELLER",
                      label: "Seller",
                      icon: Store,
                      description: "List products & grow your business",
                    },
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <Label
                        key={option.value}
                        htmlFor={`role-${option.value}`}
                        className="group flex min-h-28 cursor-pointer flex-col justify-center gap-2 rounded-2xl border border-border/80 bg-background/50 p-4 shadow-sm transition-all duration-(--duration-base) hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface-secondary has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary has-[[data-checked]]:text-primary-foreground has-[[data-checked]]:shadow-glow"
                      >
                        <RadioGroupItem
                          id={`role-${option.value}`}
                          value={option.value}
                          className="sr-only"
                        />
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          <Icon className="size-4.5 text-muted-foreground group-has-[[data-checked]]:text-primary-foreground" />
                          {option.label}
                        </span>
                        <span className="text-xs text-muted-foreground group-has-[[data-checked]]:text-primary-foreground/85">
                          {option.description}
                        </span>
                      </Label>
                    );
                  })}
                </RadioGroup>
              )}
            />
          </div>

          {/* Create Account */}
          <Button
            type="submit"
            className="h-12 w-full gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-deep text-primary-foreground shadow-glow transition-all hover:-translate-y-0.5 hover:shadow-glow-hover"
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>

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

          {/* Social */}
          <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-xl border-border/80 bg-background/70 gap-2 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-surface-secondary"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
            >
              <GoogleIcon className="size-4.5 shrink-0" />
              Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-xl border-border/80 bg-background/70 gap-2 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-surface-secondary"
              onClick={handleFacebookLogin}
              disabled={isSubmitting}
            >
              <FacebookIcon className="size-4.5 shrink-0" />
              Facebook
            </Button>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
