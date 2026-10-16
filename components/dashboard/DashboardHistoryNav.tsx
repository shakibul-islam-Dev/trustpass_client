"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

/** History length does not change reactively; read it through a no-op store. */
const emptySubscribe = () => () => {};
const getCanGoBack = () =>
  typeof window !== "undefined" ? window.history.length > 1 : false;
const getServerCanGoBack = () => false;

/**
 * Browser-style Back / Forward controls for the dashboard header.
 *
 * The App Router does not expose a history index, so "forward" availability is
 * tracked locally: pressing Back arms it, pressing Forward disarms it. Nothing
 * here is security — it only mirrors what the browser already allows.
 */
export default function DashboardHistoryNav() {
  const router = useRouter();
  const canGoBack = useSyncExternalStore(
    emptySubscribe,
    getCanGoBack,
    getServerCanGoBack,
  );
  const [canGoForward, setCanGoForward] = useState(false);

  const goBack = useCallback(() => {
    setCanGoForward(true);
    router.back();
  }, [router]);

  const goForward = useCallback(() => {
    setCanGoForward(false);
    router.forward();
  }, [router]);

  return (
    <div className="flex items-center gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={goBack}
        disabled={!canGoBack}
        aria-label="Go back"
        title="Go back"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={goForward}
        disabled={!canGoForward}
        aria-label="Go forward"
        title="Go forward"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
