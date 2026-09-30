"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { submitReport, type ICreateReportPayload } from "@/lib/customer_action/reports";
import { ReportForm } from "./ReportForm";

interface CustomerReportFormModalProps {
  businessId: string;
  businessName: string;
  /**
   * Optional: Custom trigger button.
   * Must be a single React element (not string/number/array).
   */
  trigger?: React.ReactElement;
  /**
   * Optional: Callback after successful submit.
   */
  onSuccess?: () => void;
}

export const CustomerReportFormModal = ({
  businessId,
  businessName,
  trigger,
  onSuccess,
}: CustomerReportFormModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handles form submission.
   */
  const handleSubmit = async (payload: ICreateReportPayload) => {
    setIsSubmitting(true);
    try {
      const result = await submitReport(payload);

      if (result?.error) {
        alert("Failed to submit report. Please try again.");
        return;
      }

      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Report submission failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Default trigger button if none provided
  const defaultTrigger = (
    <Button variant="destructive" size="sm">
      <Flag className="mr-2 h-4 w-4" />
      Report Business
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={trigger ?? defaultTrigger} />

      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Report {businessName}
          </DialogTitle>
          <DialogDescription>
            Help us keep TrustPass safe. Your report will be reviewed by our moderators.
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