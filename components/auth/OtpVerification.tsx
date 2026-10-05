"use client"

import { Button } from "@/components/ui/button"

interface OtpVerificationProps {
  email: string
  otp: string
  isVerifying: boolean
  onOtpChange: (otp: string) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onBack: () => void
  error?: string | null
}

export default function OtpVerification({
  email,
  otp,
  isVerifying,
  onOtpChange,
  onSubmit,
  onBack,
  error,
}: OtpVerificationProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-950">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Trust Pass
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            We have sent a 6-digit OTP to {email}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm font-medium text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400"
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
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
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                onOtpChange(value)
              }}
              required
              disabled={isVerifying}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-center text-lg font-bold tracking-widest outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-white"
            />
          </div>

          <Button
            type="submit"
            className="mt-2 w-full py-2.5 font-medium"
            disabled={isVerifying}
          >
            {isVerifying ? "Verifying OTP..." : "Verify OTP"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="mt-2 w-full py-2.5 font-medium"
            onClick={onBack}
            disabled={isVerifying}
          >
            Back to Sign Up
          </Button>
        </form>
      </div>
    </div>
  )
}
