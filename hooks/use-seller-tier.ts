"use client";

import { useEffect, useState } from "react";

import { getSellerTier, type SellerTier } from "@/lib/core/plan";

/**
 * Reads the seller's plan once per mount.
 *
 * The dashboard header/sidebar live in the shared `/dashboard` layout, which
 * does not remount while moving between dashboard pages, so this resolves a
 * single time per dashboard session.
 */
export function useSellerTier(enabled = true) {
  const [tier, setTier] = useState<SellerTier>("FREE");
  const [resolved, setResolved] = useState(!enabled);

  useEffect(() => {
    if (!enabled) return;

    let active = true;

    getSellerTier()
      .then((value) => {
        if (active) setTier(value);
      })
      .catch(() => {
        if (active) setTier("FREE");
      })
      .finally(() => {
        if (active) setResolved(true);
      });

    return () => {
      active = false;
    };
  }, [enabled]);

  return { tier, isLoading: enabled && !resolved };
}
