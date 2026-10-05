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
} from "@/lib/core/auth-api";
import { signInWithSocial } from "@/lib/core/session";

/*
 * OTP VERIFICATION IS COMMENTED OUT
 *
 * This form used to move to a second screen with an `OtpForm`, then call
 * `verifyOtp` followed by `loginWithPassword` (verify-otp sets no session
 * cookie of its own). `verifyOtp` and `resendOtp` are commented out in
 * `lib/core/auth-api.ts`: the server's SMTP config is unset, so it swallows
 * the send failure and answers 201/200 while producing no mail.
 *
 * Registration therefore now ends at the account existing. Note the server runs
 * better-auth with `requireEmailVerification: true`, so the new account cannot
 * sign in yet — see the 403 note in `LoginForm.tsx`. Restoring OTP means
 * uncommenting those two functions and bringing this screen back.
 */

interface InputForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  role: "CUSTOMER" | "SELLER";
}

export default function RegistrationForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
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
  // Registration
  // ============================================================

  const onSubmit: SubmitHandler<InputForm> = async (formData) => {
    setErrorMessage(null);

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
        // 409: the address is already on file. Registration cannot continue and
        // OTP is disabled, so the only useful move is to send them to sign in.
        if (response.status === 409) {
          setErrorMessage(
            "That email is already registered. Taking you to sign in.",
          );
          router.push("/auth/login");
          return;
        }

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

      // The account exists. OTP is disabled, and the server runs with
      // `requireEmailVerification: true`, so this new account cannot sign in
      // yet — do not send the user to the login screen to hit that 403 without
      // warning. Say what happened and what they can do.
      setErrorMessage(
        "Account created. Email verification is currently unavailable, so " +
          "sign-in is disabled for this account until the server's mail " +
          "transport is configured.",
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
  // OTP Verification
  //
  // COMMENTED OUT. The handler that called `verifyOtp` and then
  // `loginWithPassword` (verify-otp sets no session cookie of its own) is
  // restored from git history alongside the two API functions it depends on.
  // The OTP screen this rendered is described at the top of this file.
  // ============================================================

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
        <CardDescription>Create your account to get started</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Error Message */}
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* ====================================================
             REGISTRATION FORM

             The OTP screen that used to be rendered here is commented out; see
             the note at the top of this file. It was this conditional:
               {showOtpScreen ? <OtpForm ... /> : <form ...>}
             so restoring it means reintroducing the branch and the
             `showOtpScreen` state.
        ==================================================== */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                {...register("name", {
                  required: "Full name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                  maxLength: {
                    value: 100,
                    message: "Name cannot exceed 100 characters",
                  },
                })}
              />
              {errors.name && (
                <p className="text-xs font-medium text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="john@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-xs font-medium text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                  maxLength: {
                    value: 128,
                    message: "Password cannot exceed 128 characters",
                  },
                })}
              />
              {errors.password && (
                <p className="text-xs font-medium text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="text"
                autoComplete="tel"
                placeholder="+8801712345678"
                {...register("phone", {
                  pattern: {
                    value: /^[+0-9\s\-()]{7,20}$/,
                    message: "Invalid phone number format",
                  },
                })}
              />
              {errors.phone && (
                <p className="text-xs font-medium text-destructive">
                  {errors.phone.message}
                </p>
              )}
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
      </CardContent>
    </Card>
  </div>
);
}