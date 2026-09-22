"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { TrustRule } from "@/types/admin";

interface TrustRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule: TrustRule | null; // null = Add mode, not null = Edit mode
  onSave: (rule: TrustRule) => void;
}

const CATEGORIES = ["Verification", "Business Info", "Customer Feedback", "Activity", "Other"];

export const TrustRuleModal = ({
  isOpen,
  onClose,
  rule,
  onSave,
}: TrustRuleModalProps) => {
  const isEditMode = !!rule;

  // Form State — initialized directly from rule prop (no useEffect needed)
  const [ruleName, setRuleName] = useState(rule?.ruleName ?? "");
  const [category, setCategory] = useState(rule?.category ?? "Verification");
  const [weightPoints, setWeightPoints] = useState(rule?.weightPoints ?? 10);
  const [description, setDescription] = useState(rule?.description ?? "");

  const handleSubmit = () => {
    if (!ruleName.trim() || !description.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    const newRule: TrustRule = {
      id: rule?.id || `rule_${Date.now()}`,
      ruleName: ruleName.trim(),
      category,
      weightPoints: Number(weightPoints),
      isActive: rule?.isActive ?? true,
      description: description.trim(),
    };

    onSave(newRule);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Trust Rule" : "Add New Trust Rule"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the rule details below."
              : "Define a new rule to calculate business trust scores."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Rule Name */}
          <div className="space-y-2">
            <Label htmlFor="ruleName">Rule Name</Label>
            <Input
              id="ruleName"
              placeholder="e.g., Email Verified"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value ?? "Verification")}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Weight Points */}
          <div className="space-y-2">
            <Label htmlFor="weightPoints">Weight Points</Label>
            <Input
              id="weightPoints"
              type="number"
              placeholder="e.g., 10"
              value={weightPoints}
              onChange={(e) => setWeightPoints(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Use positive numbers to add points, negative to deduct.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Explain what this rule does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {isEditMode ? "Update Rule" : "Create Rule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};