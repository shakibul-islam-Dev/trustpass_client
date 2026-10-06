"use client"

import { FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"

interface OtpFormProps {
  email: string
  isVerifying?: boolean
  onVerify: (otp: string) => Promise<void> | void
  onBack?: () => void
  backButtonText?: string
  submitButtonText?: string
  verifyingText?: string
  /** Optional resend control. Omit it where resending is not offered. */
  onResend?: () => Promise<void> | void
  isResending?: boolean
  resendButtonText?: string
  resendingText?: string
}

export default function OtpForm({
  email,
  isVerifying = false,
  onVerify,
  onBack,
  backButtonText = "Back",
  submitButtonText = "Verify OTP",
  verifyingText = "Verifying OTP...",
  onResend,
  isResending = false,
  resendButtonText = "Resend code",
  resendingText = "Sending...",
}: OtpFormProps) {
  const [otpCode, setOtpCode] = useState("")

  /**
   * No local checks here on purpose — the server validates the code and its
   * message ("OTP must be exactly 6 digits") is what the user sees. The only
   * thing done locally is keeping non-digits out of the field, which is input
   * tidying rather than validation.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await onVerify(otpCode.trim())
  }

  const handleOtpChange = (value: string) => {
    setOtpCode(value.replace(/\D/g, "").slice(0, 6))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        We sent a 6-digit code to{" "}
        <span className="font-medium text-gray-700 dark:text-gray-200">
          {email}
        </span>
      </p>

      <div>
        <label
          htmlFor="otp"
          className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300"
        >
          6-Digit OTP Code
        </label>

        <input
          id="otp"
          name="otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          value={otpCode}
          onChange={(e) => handleOtpChange(e.target.value)}
          disabled={isVerifying}
          className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-center text-lg font-bold tracking-widest outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-white"
        />
      </div>

      <Button
        type="submit"
        className="mt-2 w-full py-2.5 font-medium"
        disabled={isVerifying}
      >
        {isVerifying ? verifyingText : submitButtonText}
      </Button>

      {onResend && (
        <button
          type="button"
          onClick={() => void onResend()}
          disabled={isVerifying || isResending}
          className="w-full text-center text-sm text-slate-500 hover:underline disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-400"
        >
          {isResending ? resendingText : resendButtonText}
        </button>
      )}

      {onBack && (
        <Button
          type="button"
          variant="outline"
          className="mt-2 w-full py-2.5 font-medium"
          onClick={onBack}
          disabled={isVerifying}
        >
          {backButtonText}
        </Button>
      )}
    </form>
  )
}
