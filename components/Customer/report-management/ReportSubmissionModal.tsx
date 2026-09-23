"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ReportSubmissionData, ReportCategory } from "@/types/customer";

interface ReportSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReportSubmissionData) => void;
}

const CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: "FRAUD", label: "Fraud" },
  { value: "MISLEADING", label: "Misleading Information" },
  { value: "NON_DELIVERY", label: "Non-Delivery" },
  { value: "OTHER", label: "Other" },
];

export const ReportSubmissionModal = ({
  isOpen,
  onClose,
  onSubmit,
}: ReportSubmissionModalProps) => {
  // Form State
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState<ReportCategory>("FRAUD");
  const [description, setDescription] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");

  const handleSubmit = () => {
    if (!businessName.trim() || !description.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    const data: ReportSubmissionData = {
      businessId: `biz_${Date.now()}`, // Temporary - backend will provide real ID
      businessName: businessName.trim(),
      category,
      description: description.trim(),
      evidenceUrl: evidenceUrl.trim() || undefined,
    };

    onSubmit(data);

    // Reset form
    setBusinessName("");
    setCategory("FRAUD");
    setDescription("");
    setEvidenceUrl("");

    onClose();
  };

  const handleClose = () => {
    // Reset form on close
    setBusinessName("");
    setCategory("FRAUD");
    setDescription("");
    setEvidenceUrl("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit a Report</DialogTitle>
          <DialogDescription>
            Report a business for fraudulent or misleading activity. Your report will be reviewed by our moderators.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="businessName">
              Business Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="businessName"
              placeholder="e.g., Tech Solutions Ltd."
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Report Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory((value ?? "FRAUD") as ReportCategory)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what happened in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>

          {/* Evidence URL (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="evidenceUrl">
              Evidence URL <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="evidenceUrl"
              type="url"
              placeholder="https://example.com/screenshot.jpg"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Provide a link to any supporting evidence (screenshot, invoice, etc.)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};