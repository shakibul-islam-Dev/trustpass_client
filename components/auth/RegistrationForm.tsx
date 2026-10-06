"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  gender: "MALE" | "FEMALE" | "OTHER";
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
      gender: "MALE",
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
        gender: formData.gender,
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
  <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-extrabold tracking-tight">
          Trust Pass
        </CardTitle>
        <CardDescription>
          {otpEmail
            ? "Verify your email to finish"
            : "Create your account to get started"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Error Message */}
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Shown only after a 409. Puts the one useful next step right under
            the message instead of silently redirecting away from it. */}
        {emailTaken && (
          <Button
            type="button"
            variant="outline"
            className="mb-4 w-full"
            onClick={() => router.push("/auth/login")}
          >
            Go to sign in
          </Button>
        )}

        {/* Neutral notice (e.g. "code sent") */}
        {notice && !errorMessage && (
          <Alert className="mb-4">
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        )}

        {/* ====================================================
             OTP step — replaces the form once the account exists.
        ==================================================== */}
        {otpEmail ? (
          <>
            <p className="mb-4 text-center text-sm text-muted-foreground">
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
          </>
        ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                {...register("name")}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="john@example.com"
                {...register("email")}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...register("password")}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="text"
                autoComplete="tel"
                placeholder="+8801712345678"
                {...register("phone")}
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Account Type */}
            <div className="space-y-2">
              <Label htmlFor="role">Account Type</Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CUSTOMER">Customer</SelectItem>
                      <SelectItem value="SELLER">Seller</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Create Account */}
            <Button
              type="submit"
              className="mt-2 w-full py-2.5 font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>

            {/* Google */}
            <Button
              type="button"
              variant="outline"
              className="mt-2 w-full py-2.5 font-medium"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
            >
              Continue with Google
            </Button>

            {/* Facebook */}
            <Button
              type="button"
              variant="outline"
              className="mt-2 w-full py-2.5 font-medium"
              onClick={handleFacebookLogin}
              disabled={isSubmitting}
            >
              Continue with Facebook
            </Button>
        </form>
        )}

        {/* Link to the other form. Without this, a visitor who picked "Sign Up"
            by mistake had no way back except editing the URL. */}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            className="font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => router.push("/auth/login")}
          >
            Sign in
          </button>
        </p>
      </CardContent>
    </Card>
  </div>
);
}