"use client"

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { authClient } from "@/lib/auth-client";
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
import OtpForm from "@/components/otp/OtpForm";

interface InputForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  role: "CUSTOMER" | "SELLER";
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function RegistrationForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
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

    if (!API_BASE_URL) {
      setErrorMessage("API URL is not configured.");
      return;
    }

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const phone = formData.phone.trim();

    try {
      const { error: authError } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (authError) {
        setErrorMessage(
          authError.message || "Better Auth registration failed.",
        );
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name,
            email,
            password,
            phone: phone || undefined,
            gender: formData.gender,
            role: formData.role,
            image: undefined,
          }),
        },
      );

      let resData: {
        success?: boolean;
        message?: string;
        data?: {
          email?: string;
        };
      };

      try {
        resData = await response.json();
      } catch {
        setErrorMessage("Invalid response received from the server.");
        return;
      }

      if (!response.ok || !resData.success) {
        setErrorMessage(
          resData.message || "Registration could not be completed.",
        );
        return;
      }

      const registeredEmail = resData.data?.email || email;

      setUserEmail(registeredEmail);
      setOtpCode("");
      setShowOtpScreen(true);
    } catch (error: unknown) {
      console.error("Registration error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while registering.";

      setErrorMessage(message);
    }
  };

  // ============================================================
  // OTP Verification
  // ============================================================

  const handleVerifyOtp = async (
    e: FormEvent<HTMLFormElement>,
    providedOtp?: string
  ) => {
    e.preventDefault();

    setErrorMessage(null);

    const cleanOtp = (providedOtp ?? otpCode).trim();

    if (!cleanOtp) {
      setErrorMessage("Please enter the OTP code.");
      return;
    }

    if (cleanOtp.length !== 6) {
      setErrorMessage("OTP must be exactly 6 digits.");
      return;
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      setErrorMessage("OTP must contain only numbers.");
      return;
    }

    if (!userEmail) {
      setErrorMessage("User email is missing. Please register again.");
      return;
    }

    if (!API_BASE_URL) {
      setErrorMessage("API URL is not configured.");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: userEmail,
            otp: cleanOtp,
          }),
        },
      );

      let resData: {
        success?: boolean;
        message?: string;
        data?: unknown;
      };

      try {
        resData = await response.json();
      } catch {
        setErrorMessage("Invalid response received from the server.");
        return;
      }

      if (!response.ok || !resData.success) {
        setErrorMessage(
          resData.message || "OTP verification failed.",
        );
        return;
      }

      console.log("Verified successfully:", resData.data);
      router.push("/");
    } catch (error: unknown) {
      console.error("Verify OTP error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while verifying the OTP.";

      setErrorMessage(message);
    } finally {
      setIsVerifying(false);
    }
  };

  // ============================================================
  // Google Login
  // ============================================================

  const handleGoogleLogin = async () => {
    setErrorMessage(null);

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (error) {
        setErrorMessage(
          error.message || "Google login failed.",
        );
      }
    } catch (error: unknown) {
      console.error("Google login error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong during Google login.";

      setErrorMessage(message);
    }
  };

  // ============================================================
  // Facebook Login
  // ============================================================

  const handleFacebookLogin = async () => {
    setErrorMessage(null);

    try {
      const { error } = await authClient.signIn.social({
        provider: "facebook",
        callbackURL: "/",
      });

      if (error) {
        setErrorMessage(
          error.message || "Facebook login failed.",
        );
      }
    } catch (error: unknown) {
      console.error("Facebook login error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong during Facebook login.";

      setErrorMessage(message);
    }
  };

  // ============================================================
  // Back to registration
  // ============================================================

  const handleBackToRegistration = () => {
    setErrorMessage(null);
    setOtpCode("");
    setShowOtpScreen(false);
  };

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
          {showOtpScreen
            ? `We have sent a 6-digit OTP to ${userEmail}`
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

        {/* ======================================================
            OTP SCREEN
        ====================================================== */}
        {showOtpScreen ? (
          <OtpForm
            email={userEmail}
            isVerifying={isVerifying}
            onVerify={async (otp) => {
              setOtpCode(otp);
              const fakeEvent = {
                preventDefault: () => {},
              } as FormEvent<HTMLFormElement>;
              await handleVerifyOtp(fakeEvent, otp);
            }}
            onBack={handleBackToRegistration}
            backButtonText="Back to Sign Up"
            submitButtonText="Verify OTP"
            verifyingText="Verifying OTP..."
          />
        ) : (
          /* ====================================================
             REGISTRATION FORM
          ==================================================== */
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
        )}
      </CardContent>
    </Card>
  </div>
);
}