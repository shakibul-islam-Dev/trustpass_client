"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

/**
 * Toasts — TrustPass themed.
 *
 * Wraps sonner's `<Toaster>` and maps every toast state onto the app's own
 * design tokens (see `app/globals.css`) instead of sonner's generic rich
 * palette, so a toast looks like every other TrustPass surface:
 *
 *   • soft, status-tinted background   (same recipe as `bg-success-soft`)
 *   • status-coloured icon + text      (same as `text-success`)
 *   • `rounded-field` corners          (12px — matches buttons/inputs)
 *   • app font + `shadow-surface`
 *
 * Placement lives in `AppToaster` (bottom-right); this file only owns the look.
 * Deep-link the font/shape overrides in `app/globals.css` under the
 * "sonner toasts" comment — sonner injects its own stylesheet at runtime, so
 * those rules use a higher specificity to win.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          // Neutral / untinted toast
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",

          // Success — brand green
          "--success-bg": "color-mix(in oklab, var(--success) 15%, var(--popover))",
          "--success-border": "color-mix(in oklab, var(--success) 35%, var(--border))",
          "--success-text": "var(--success)",

          // Info — brand blue (there is no dedicated info token)
          "--info-bg": "color-mix(in oklab, var(--primary) 12%, var(--popover))",
          "--info-border": "color-mix(in oklab, var(--primary) 32%, var(--border))",
          "--info-text": "var(--primary)",

          // Warning — brand amber
          "--warning-bg": "color-mix(in oklab, var(--warning) 16%, var(--popover))",
          "--warning-border": "color-mix(in oklab, var(--warning) 38%, var(--border))",
          "--warning-text": "var(--warning)",

          // Error — brand danger/red
          "--error-bg": "color-mix(in oklab, var(--danger) 12%, var(--popover))",
          "--error-border": "color-mix(in oklab, var(--danger) 32%, var(--border))",
          "--error-text": "var(--danger)",

          // Shape — 12px, the app's `rounded-field`
          "--border-radius": "calc(var(--radius) * 1.5)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
