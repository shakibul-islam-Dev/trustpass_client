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
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const cleanOtp = otpCode.trim()

    if (!cleanOtp) {
      setError("Please enter the OTP code.")
      return
    }

    if (cleanOtp.length !== 6) {
      setError("OTP must be exactly 6 digits.")
      return
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      setError("OTP must contain only numbers.")
      return
    }

    await onVerify(cleanOtp)
  }

  const handleOtpChange = (value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 6)
    setOtpCode(sanitized)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          required
          disabled={isVerifying}
          className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-center text-lg font-bold tracking-widest outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-white"
        />
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
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
