"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "cn"
import { Input } from "@/components/ui/input"

/**
 * Password field with a show/hide toggle.
 *
 * Wraps the shared `Input` so every password box in the app behaves the same.
 * The toggle is a `type="button"`, so it can never submit the form it sits in,
 * and it exposes its state through `aria-pressed` for screen readers.
 */
function PasswordInput({
  className,
  disabled,
  ...props
}: React.ComponentProps<"input">) {
  const [visible, setVisible] = React.useState(false)

  return (
    <div className="relative">
      <Input
        {...props}
        disabled={disabled}
        type={visible ? "text" : "password"}
        className={cn("pr-11", className)}
      />

      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        disabled={disabled}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 disabled:pointer-events-none disabled:opacity-50"
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}

export { PasswordInput }
