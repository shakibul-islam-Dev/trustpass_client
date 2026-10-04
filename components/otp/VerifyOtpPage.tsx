"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OtpForm from "@/components/otp/OtpForm";

const VerifyOtpPage = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const handleVerifyOtp = async (otp: string) => {
    setIsVerifying(true);

    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Verification successful");
        router.push("/dashboard");
      } else {
        console.log(data, "Invalid OTP or Error");
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-950">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Verify OTP
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Sent OTP to: <strong>{email || "your email"}</strong>
          </p>
        </div>

        <OtpForm
          email={email}
          isVerifying={isVerifying}
          onVerify={handleVerifyOtp}
          submitButtonText="Verify OTP"
          verifyingText="Verifying OTP..."
        />
      </div>
    </div>
  );
};

export default VerifyOtpPage;
