"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import type { ICreateReportPayload, TReportReason } from "@/lib/customer_action/reports";

interface ReportFormProps {
  businessId: string;
  onSubmit: (payload: ICreateReportPayload) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const REPORT_REASONS: { value: TReportReason; label: string; description: string }[] = [
  { value: "FRAUD", label: "Fraud", description: "Fake business, scam, or fraud" },
  { value: "SPAM", label: "Spam", description: "Spam or irrelevant content" },
  { value: "INAPPROPRIATE_CONTENT", label: "Inappropriate Content", description: "Offensive or inappropriate material" },
  { value: "HARASSMENT", label: "Harassment", description: "Harassment or abusive behavior" },
  { value: "OTHER", label: "Other", description: "Other issues not listed above" },
];

export const ReportForm = ({
  businessId,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ReportFormProps) => {
  // --- Form State ---
  const [reason, setReason] = useState<TReportReason>("FRAUD");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState("");

  // --- Handlers ---

  /**
   * Adds a new evidence URL to the list.
   */
  const handleAddEvidence = () => {
    if (!currentUrl.trim()) return;
    try {
      new URL(currentUrl); // Validate URL format
      setEvidenceUrls((prev) => [...prev, currentUrl.trim()]);
      setCurrentUrl("");
    } catch {
      alert("Please enter a valid URL");
    }
  };

  /**
   * Removes an evidence URL from the list.
   */
  const handleRemoveEvidence = (index: number) => {
    setEvidenceUrls((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Handles form submission.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (description.trim().length < 20) {
      alert("Description must be at least 20 characters long.");
      return;
    }

    const payload: ICreateReportPayload = {
      businessId,
      reason,
      title: title.trim() || undefined,
      description: description.trim(),
      evidenceUrls: evidenceUrls.length > 0 ? evidenceUrls : undefined,
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Reason Dropdown */}
      <div className="space-y-2">
        <Label htmlFor="reason">
          Report Reason <span className="text-destructive">*</span>
        </Label>
        <Select
          value={reason}
          onValueChange={(value) => setReason((value ?? "FRAUD") as TReportReason)}
        >
          <SelectTrigger id="reason">
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            {REPORT_REASONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{r.label}</span>
                  <span className="text-xs text-muted-foreground">{r.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Title (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-muted-foreground text-xs">(Optional)</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g., Fake product delivered"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground text-right">
          {title.length}/100
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Describe what happened in detail (min 20 characters)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground text-right">
          {description.length}/1000
        </p>
      </div>

      {/* Evidence URLs */}
      <div className="space-y-2">
        <Label>
          Evidence URLs{" "}
          <span className="text-muted-foreground text-xs">(Optional)</span>
        </Label>

        {/* URL Input + Add Button */}
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://example.com/screenshot.jpg"
            value={currentUrl}
            onChange={(e) => setCurrentUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddEvidence();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddEvidence}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Evidence List */}
        {evidenceUrls.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {evidenceUrls.map((url, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1 py-1.5 pl-3 pr-2"
              >
                <span className="truncate max-w-[200px] text-xs">{url}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveEvidence(index)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </Button>
      </div>
    </form>
  );
};