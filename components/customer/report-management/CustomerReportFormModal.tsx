"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  submitReport,
  type ICreateReportPayload,
} from "@/lib/customer_action/reports";
import { ReportForm } from "./ReportForm";
// 🔑 Tor session helper — path adjust kor jodi different hoy
import { getSession } from "@/lib/core/session";

interface CustomerReportFormModalProps {
  businessId: string;
  businessName: string;
  trigger?: React.ReactElement;
  onSuccess?: () => void;
}

export const CustomerReportFormModal = ({
  businessId,
  businessName,
  trigger,
  onSuccess,
}: CustomerReportFormModalProps) => {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null = loading

  // ── Session check on mount ──
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const session = await getSession();
        if (!cancelled) {
          setIsLoggedIn(!!session.user);
        }
      } catch (err) {
        console.error("Session check failed:", err);
        if (!cancelled) setIsLoggedIn(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Redirect to login ──
  const redirectToLogin = () => {
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "/";
    router.push(
      `/auth/login?redirect=${encodeURIComponent(currentPath)}`
    );
  };

  // ── Modal open handler (login gate) ──
  const handleOpenChange = (open: boolean) => {
    if (open && isLoggedIn === false) {
      toast.error("Please login to report a business.");
      redirectToLogin();
      return;
    }
    setIsOpen(open);
  };

  // ── Submit ──
  const handleSubmit = async (payload: ICreateReportPayload) => {
    // Double-check login
    if (isLoggedIn === false) {
      toast.error("Please login to submit a report.");
      redirectToLogin();
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitReport(payload);

      if (result?.error) {
        toast.error("Failed to submit report. Please try again.");
        return;
      }

      toast.success("Report submitted successfully!");
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Report submission failed:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Default trigger — disabled while session loading ──
  const defaultTrigger = (
    <Button
      variant="destructive"
      size="sm"
      disabled={isLoggedIn === null}
      title={
        isLoggedIn === null
          ? "Checking session..."
          : isLoggedIn === false
          ? "Login required"
          : "Report this business"
      }
    >
      {isLoggedIn === null ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Flag className="mr-2 h-4 w-4" />
      )}
      Report Business
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger ?? defaultTrigger} />

      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Report {businessName}
          </DialogTitle>
          <DialogDescription>
            Help us keep TrustPass safe. Your report will be reviewed by our
            moderators.
          </DialogDescription>
        </DialogHeader>

        <ReportForm
          businessId={businessId}
          onSubmit={handleSubmit}
          onCancel={() => setIsOpen(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};