"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type Inputs = {
  email: string;
  password?: string;
  otp?: string;
};

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Step State: 'credentials' -> 'otp'
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [userEmail, setUserEmail] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    mode: "onSubmit",
  });

  // Message reset handler
  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // STEP 1: Verify Password & Send OTP
  const onHandleLogin: SubmitHandler<Inputs> = async (formData) => {
    clearMessages();

    try {
      // ১. Better Auth Email/Password Credentials Verification
      const loginRes = await authClient.signIn.email({
        email: formData.email,
        password: formData.password!,
      });

      if (loginRes.error) {
        setErrorMessage(loginRes.error.message || "Invalid email or password");
        return;
      }

      // ২. Send Verification OTP to Email
      const otpRes = await authClient.emailOtp.sendVerificationOtp({
        email: formData.email,
        type: "sign-in",
      });

      if (otpRes.error) {
        setErrorMessage(
          otpRes.error.message || "Credentials matched, but failed to send OTP."
        );
        return;
      }

      // ৩. Move to OTP Step
      setUserEmail(formData.email);
      setSuccessMessage("Credentials verified! OTP has been sent to your email.");
      setStep("otp");
      reset(); // Clean form state for OTP input
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  // STEP 2: Verify OTP and Redirect
  const onVerifyOtp: SubmitHandler<Inputs> = async (formData) => {
    clearMessages();

    try {
      const { data, error } = await authClient.signIn.emailOtp({
        email: userEmail,
        otp: formData.otp!,
      });

      if (error) {
        setErrorMessage(error.message || "Invalid or expired OTP");
        return;
      }

      console.log("Full Login Successful:", data);
      setSuccessMessage("Login successful! Redirecting...");

      // Dashboard Direct Redirect
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage("Failed to verify OTP. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] p-4">
      <div className="w-full max-w-md p-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {step === "credentials" ? "Login" : "Two-Step Verification"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {step === "credentials"
              ? "Enter your credentials to verify your account"
              : `Enter the 6-digit OTP code sent to ${userEmail}`}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-md text-center">
            {errorMessage}
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-md text-center">
            {successMessage}
          </div>
        )}

        {/* STEP 1: EMAIL + PASSWORD FORM */}
        {step === "credentials" && (
          <form onSubmit={handleSubmit(onHandleLogin)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="w-full px-3 py-2 border rounded-md border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-slate-300"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-10 border rounded-md border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-slate-300"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Verifying Credentials..." : "Continue"}
            </Button>
          </form>
        )}

        {/* STEP 2: OTP INPUT FORM */}
        {step === "otp" && (
          <form onSubmit={handleSubmit(onVerifyOtp)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                One-Time Password
              </label>
              <input
                id="otp"
                type="text"
                maxLength={6}
                placeholder="123456"
                className="w-full px-3 py-2 border rounded-md border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-slate-300 text-center tracking-[0.5em] font-mono text-lg"
                {...register("otp", {
                  required: "OTP is required",
                  minLength: {
                    value: 6,
                    message: "OTP must be 6 digits",
                  },
                })}
              />
              {errors.otp && (
                <p className="text-sm text-red-500 font-medium">{errors.otp.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Verifying OTP..." : "Verify & Sign In"}
            </Button>

            <button
              type="button"
              onClick={() => {
                clearMessages();
                setStep("credentials");
                reset();
              }}
              className="w-full text-xs text-slate-500 hover:underline text-center mt-2"
            >
              Back to Login
            </button>
          </form>
        )}

      </div>
    </div>
  );
}