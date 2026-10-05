"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { TrustRule, TTrustRuleStatus } from "@/types/admin";

interface TrustRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule: TrustRule | null; // null = Add mode
  onSave: (data: {
    ruleKey: string;
    label: string;
    points: number;
    status: TTrustRuleStatus;
    isActive?: boolean;
  }) => void;
}

const STATUS_OPTIONS: { value: TTrustRuleStatus; label: string }[] = [
  { value: "VERIFICATION", label: "Verification" },
  { value: "ACTIVITY", label: "Activity" },
  { value: "REPORT", label: "Report" },
];

export const TrustRuleModal = ({
  isOpen,
  onClose,
  rule,
  onSave,
}: TrustRuleModalProps) => {
  const isEditMode = !!rule;

  // Form state (initialized from rule prop when editing)
  const [ruleKey, setRuleKey] = useState(rule?.ruleKey ?? "");
  const [label, setLabel] = useState(rule?.label ?? "");
  const [points, setPoints] = useState(rule?.points ?? 10);
  const [status, setStatus] = useState<TTrustRuleStatus>(
    rule?.status ?? "VERIFICATION"
  );
  const [isActive, setIsActive] = useState(rule?.isActive ?? true);

  const handleSubmit = () => {
    if (!ruleKey.trim() || !label.trim()) {
      toast.error("Rule key and label are required.");
      return;
    }

    onSave({
      ruleKey: ruleKey.trim(),
      label: label.trim(),
      points: Number(points),
      status,
      isActive,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Trust Rule" : "Add New Trust Rule"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the rule details below."
              : "Define a new rule to calculate business trust scores."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Rule Key */}
          <div className="space-y-2">
            <Label htmlFor="ruleKey">
              Rule Key <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ruleKey"
              placeholder="e.g., email_verified"
              value={ruleKey}
              onChange={(e) => setRuleKey(e.target.value)}
              disabled={isEditMode} // Usually ruleKey can't be changed after creation
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier (lowercase, underscores)
            </p>
          </div>

          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="label">
              Label <span className="text-destructive">*</span>
            </Label>
            <Input
              id="label"
              placeholder="e.g., Email Verified"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus((v ?? "VERIFICATION") as TTrustRuleStatus)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Points */}
          <div className="space-y-2">
            <Label htmlFor="points">Points</Label>
            <Input
              id="points"
              type="number"
              placeholder="e.g., 10"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Positive numbers add points, negative to deduct.
            </p>
          </div>

          {/* Is Active */}
          <div className="space-y-2">
            <Label htmlFor="isActive">Active Status</Label>
            <Select
              value={isActive ? "true" : "false"}
              onValueChange={(v) => setIsActive(v === "true")}
            >
              <SelectTrigger id="isActive">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {isEditMode ? "Update Rule" : "Create Rule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};