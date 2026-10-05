
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import OtpForm from "@/components/otp/OtpForm";

type Inputs = {
  email: string;
  otp?: string;
};

export default function LoginForm() {
  const router = useRouter();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [userEmail, setUserEmail] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    mode: "onSubmit",
  });

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // ==========================================
  // STEP 1: SEND SIGN-IN OTP
  // ==========================================

  const handleSendOtp: SubmitHandler<Inputs> = async (formData) => {
    clearMessages();

    try {
      const { error } =
        await authClient.emailOtp.sendVerificationOtp({
          email: formData.email,
          type: "sign-in",
        });

      if (error) {
        setErrorMessage(
          error.message || "Failed to send OTP. Please try again."
        );
        return;
      }

      setUserEmail(formData.email);

      setSuccessMessage(
        "OTP has been sent to your email address."
      );

      setStep("otp");

      reset();
    } catch (error) {
      console.error("Send OTP error:", error);

      setErrorMessage(
        "Something went wrong while sending OTP."
      );
    }
  };

  // ==========================================
  // STEP 2: VERIFY OTP & SIGN IN
  // ==========================================

  const handleVerifyOtp: SubmitHandler<Inputs> = async (
    formData
  ) => {
    clearMessages();

    try {
      const { data, error } =
        await authClient.signIn.emailOtp({
          email: userEmail,
          otp: formData.otp!,
        });

      if (error) {
        setErrorMessage(
          error.message || "Invalid or expired OTP."
        );
        return;
      }

      console.log("Login successful:", data);

      setSuccessMessage(
        "Login successful! Redirecting..."
      );

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Verify OTP error:", error);

      setErrorMessage(
        "Failed to verify OTP. Please try again."
      );
    }
  };

  // ==========================================
  // RESEND OTP
  // ==========================================

  const handleResendOtp = async () => {
    clearMessages();

    try {
      const { error } =
        await authClient.emailOtp.sendVerificationOtp({
          email: userEmail,
          type: "sign-in",
        });

      if (error) {
        setErrorMessage(
          error.message || "Failed to resend OTP."
        );
        return;
      }

      setSuccessMessage("A new OTP has been sent.");
    } catch (error) {
      console.error("Resend OTP error:", error);

      setErrorMessage(
        "Failed to resend OTP."
      );
    }
  };

  // ==========================================
  // SOCIAL LOGIN
  // ==========================================

  const handleSocialLogin = async (
    provider: "google" | "facebook"
  ) => {
    clearMessages();

    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });
    } catch (error) {
      console.error(
        `${provider} login error:`,
        error
      );

      setErrorMessage(
        `Failed to login with ${provider}.`
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
            {step === "email"
              ? "Sign In"
              : "Verify Your Email"}
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {step === "email"
              ? "Enter your email to receive a verification code."
              : `Enter the 6-digit OTP sent to ${userEmail}`}
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

        {/* ===================================== */}
        {/* STEP 1: EMAIL */}
        {/* ===================================== */}

        {step === "email" && (
          <>
            <form
              onSubmit={handleSubmit(handleSendOtp)}
              className="space-y-4"
            >
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
                      value:
                        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
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

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Sending OTP..."
                  : "Continue"}
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
                onClick={() =>
                  handleSocialLogin("google")
                }
                className="w-full"
              >
                Google
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  handleSocialLogin("facebook")
                }
                className="w-full"
              >
                Facebook
              </Button>
            </div>
          </>
        )}

        {/* ===================================== */}
        {/* STEP 2: OTP */}
        {/* ===================================== */}

        {step === "otp" && (
          <div className="space-y-4">
            <OtpForm
              email={userEmail}
              isVerifying={isSubmitting}
              onVerify={async (otp) => {
                clearMessages();
                const data = { otp } as Inputs;
                await handleVerifyOtp(data);
              }}
              onBack={() => {
                clearMessages();
                setStep("email");
                setUserEmail("");
                reset();
              }}
              backButtonText="Use a different email"
              submitButtonText="Verify & Sign In"
              verifyingText="Verifying..."
            />

            {/* Resend */}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isSubmitting}
              className="w-full text-center text-sm text-slate-500 hover:underline"
            >
              Resend OTP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
