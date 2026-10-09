"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import type {
  ICreateReportPayload,
  TReportReason,
} from "@/lib/customer_action/reports";

// Previous implementation by: Existing Developer
// Removed: FileUpload component (was calling /api/v1/upload — 404).
// Updated by: Aritro
// Reason: Backend accepts multipart/form-data with a `file` field directly
// on POST /api/v1/reports (confirmed via Postman — 201 Created).

interface ReportFormProps {
  businessId: string;
  onSubmit: (payload: ICreateReportPayload) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const REPORT_REASONS: {
  value: TReportReason;
  label: string;
  description: string;
}[] = [
  { value: "FRAUD", label: "Fraud", description: "Fake business or scam" },
  { value: "SPAM", label: "Spam", description: "Spam or irrelevant content" },
  {
    value: "INAPPROPRIATE_CONTENT",
    label: "Inappropriate",
    description: "Offensive content",
  },
  {
    value: "HARASSMENT",
    label: "Harassment",
    description: "Abusive behavior",
  },
  { value: "OTHER", label: "Other", description: "Other issues" },
];

export const ReportForm = ({
  businessId,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ReportFormProps) => {
  const [reason, setReason] = useState<TReportReason>("FRAUD");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleAddEvidence = () => {
    if (!currentUrl.trim()) return;
    try {
      new URL(currentUrl);
      setEvidenceUrls((prev) => [...prev, currentUrl.trim()]);
      setCurrentUrl("");
      toast.success("Evidence URL added");
    } catch {
      toast.error("Please enter a valid URL");
    }
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidenceUrls((prev) => prev.filter((_, i) => i !== index));
    toast.info("Evidence removed");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(f.type)) {
      toast.error("Only JPG, PNG, and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    if (f.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB.");
      e.target.value = "";
      return;
    }

    setFile(f);
    toast.success(`Selected: ${f.name}`);
  };

  const handleRemoveFile = () => {
    setFile(null);
    toast.info("File removed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (description.trim().length < 20) {
      toast.error("Description must be at least 20 characters long.");
      return;
    }

    const payload: ICreateReportPayload = {
      businessId,
      reason,
      title: title.trim() || undefined,
      description: description.trim(),
      evidenceUrls: evidenceUrls.length > 0 ? evidenceUrls : undefined,
      file: file ?? undefined,
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Reason */}
      <div className="space-y-2">
        <Label htmlFor="reason">
          Report Reason <span className="text-destructive">*</span>
        </Label>
        <Select
          value={reason}
          onValueChange={(v) => setReason((v ?? "FRAUD") as TReportReason)}
        >
          <SelectTrigger id="reason">
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            {REPORT_REASONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {REPORT_REASONS.find((r) => r.value === reason)?.description}
        </p>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Title{" "}
          <span className="text-muted-foreground text-xs">(Optional)</span>
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

      {/* Evidence */}
      <div className="space-y-2">
        <Label>
          Evidence{" "}
          <span className="text-muted-foreground text-xs">(Optional)</span>
        </Label>

        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={isSubmitting}
            className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer hover:file:bg-primary/90 file:font-medium"
          />

          <div className="hidden sm:flex items-center text-xs text-muted-foreground shrink-0">
            or
          </div>

          <div className="flex gap-2 flex-1 min-w-0">
            <Input
              type="url"
              placeholder="Paste image URL..."
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddEvidence();
                }
              }}
              className="min-w-0"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleAddEvidence}
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
            <span className="text-xs font-medium truncate flex-1">
              📎 {file.name} ({(file.size / 1024).toFixed(0)} KB)
            </span>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-muted-foreground hover:text-destructive p-1 rounded shrink-0"
              title="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {evidenceUrls.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {evidenceUrls.map((url, index) => {
              const isImage =
                /\.(jpg|jpeg|png|webp|gif)$/i.test(url) ||
                url.includes("cloudinary.com");

              return (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 border rounded-md bg-muted/30 min-w-0"
                >
                  {isImage ? (
                    <img
                      src={url}
                      alt={`Evidence ${index + 1}`}
                      className="h-12 w-12 rounded object-cover border shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded bg-muted flex items-center justify-center shrink-0">
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs font-medium">
                      Evidence #{index + 1}
                    </span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline truncate"
                    >
                      {url}
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveEvidence(index)}
                    className="text-muted-foreground hover:text-destructive p-1 rounded shrink-0"
                    title="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Upload one image (max 5MB) or paste image URLs as evidence.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </Button>
      </div>
    </form>
  );
};