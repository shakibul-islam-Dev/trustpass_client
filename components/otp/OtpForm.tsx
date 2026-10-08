"use client"

import {
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react"
import { ArrowLeft, KeyRound, RefreshCw } from "lucide-react"
import { cn } from "cn"
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

const OTP_LENGTH = 6

export default function OtpForm({
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
  const otpRef = useRef("")
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  const updateCode = (next: string) => {
    otpRef.current = next
    setOtpCode(next)
  }

  const focusBox = (index: number) => {
    inputsRef.current[index]?.focus()
  }

  /**
   * No local checks here on purpose — the server validates the code and its
   * message ("OTP must be exactly 6 digits") is what the user sees. The only
   * thing done locally is keeping non-digits out of the fields, which is input
   * tidying rather than validation.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await onVerify(otpRef.current.trim())
  }

  const handleBoxChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "")
    const chars = otpRef.current.split("")

    if (digits.length === 0) {
      // Cleared — wipe this box and step back to the previous one.
      chars[index] = ""
      updateCode(chars.join(""))
      focusBox(Math.max(0, index - 1))
      return
    }

    // Fill this box(es), then move the caret forward.
    let pos = index
    for (const ch of digits) {
      if (pos >= OTP_LENGTH) break
      chars[pos] = ch
      pos++
    }

    const next = chars.join("")
    updateCode(next)

    if (pos < OTP_LENGTH) focusBox(pos)

    // Six digits in hand -> let the server check it immediately.
    if (next.length === OTP_LENGTH) formRef.current?.requestSubmit()
  }

  const handlePaste = (e: ClipboardEvent<HTMLFormElement>) => {
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH)
    if (!digits) return

    e.preventDefault()
    updateCode(digits)
    focusBox(Math.min(digits.length, OTP_LENGTH - 1))

    if (digits.length === OTP_LENGTH) formRef.current?.requestSubmit()
  }

  const handleKeyDown =
    (index: number) => (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !otpRef.current[index] && index > 0) {
        e.preventDefault()
        focusBox(index - 1)
      } else if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault()
        focusBox(index - 1)
      } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
        e.preventDefault()
        focusBox(index + 1)
      }
    }

  const inputProps = (index: number) => ({
    ref: (node: HTMLInputElement | null) => {
      inputsRef.current[index] = node
    },
    value: otpCode[index] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      handleBoxChange(index, e.target.value),
    onKeyDown: handleKeyDown(index),
  })

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onPaste={handlePaste}
      className="space-y-5"
      noValidate
    >
      {/* 6 individual digit boxes */}
      <div role="group" aria-label="6-digit code" className="flex justify-between gap-2">
        {Array.from({ length: OTP_LENGTH }).map((_, index) => (
          <input
            key={index}
            {...inputProps(index)}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={OTP_LENGTH}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${index + 1}`}
            placeholder="•"
            disabled={isVerifying}
            className="h-12 w-10 rounded-xl border border-border/80 bg-background/70 text-center text-xl font-bold text-foreground shadow-sm outline-none transition-[border-color,box-shadow] duration-(--duration-base) placeholder:text-muted-foreground/35 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:w-12 md:text-2xl"
          />
        ))}
      </div>

      <Button
        type="submit"
        className="h-11 w-full justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-deep text-primary-foreground shadow-glow transition-shadow hover:shadow-glow-hover"
        disabled={isVerifying || otpCode.length !== OTP_LENGTH}
        size="lg"
      >
        <KeyRound className="size-4.5" />
        {isVerifying ? verifyingText : submitButtonText}
      </Button>

      {onResend && (
        <div className="space-y-2 text-center">
          <p className="text-xs text-muted-foreground">
            Didn&apos;t receive the code?
          </p>
          <button
            type="button"
            onClick={() => void onResend()}
            disabled={isVerifying || isResending}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-primary-deep hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={cn("size-3.5", isResending && "animate-spin")}
            />
            {isResending ? resendingText : resendButtonText}
          </button>
        </div>
      )}

      {onBack && (
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full justify-center gap-2 rounded-xl border-border/80 bg-background/70 transition-colors hover:border-primary/30 hover:bg-surface-secondary"
          onClick={onBack}
          disabled={isVerifying}
        >
          <ArrowLeft className="size-4" />
          {backButtonText}
        </Button>
      )}
    </form>
  )
}
