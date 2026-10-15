"use client";

import { Toaster } from "@/components/ui/sonner";

/**
 * Global toast viewport.
 *
 * Bottom-right so it never collides with the sticky 64px navbar at the top of
 * the marketing shell. Look & feel (tokens, radius, font) lives in
 * `components/ui/sonner.tsx` + `app/globals.css`.
 */
export default function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      richColors
      closeButton
      offset={20}
      gap={12}
      visibleToasts={4}
    />
  );
}
