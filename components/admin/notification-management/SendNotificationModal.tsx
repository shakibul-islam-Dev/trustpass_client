"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  sendTargetedNotification,
  type NotificationType,
} from "@/lib/admin_action/notifications_action";

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TYPE_OPTIONS: { value: NotificationType; label: string }[] = [
  { value: "SYSTEM", label: "System" },
  { value: "ACCOUNT", label: "Account" },
  { value: "BUSINESS", label: "Business" },
  { value: "VERIFICATION", label: "Verification" },
  { value: "REPORT", label: "Report" },
  { value: "TRUST_SCORE", label: "Trust Score" },
  { value: "PRODUCT", label: "Product" },
  { value: "PROMOTION", label: "Promotion" },
];

export const SendNotificationModal = ({
  isOpen,
  onClose,
  onSuccess,
}: SendNotificationModalProps) => {
  const [userId, setUserId] = useState("");
  const [type, setType] = useState<NotificationType>("SYSTEM");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setUserId("");
    setType("SYSTEM");
    setTitle("");
    setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId.trim() || !title.trim() || !message.trim()) {
      toast.error("User ID, title, and message are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await sendTargetedNotification({
        userId: userId.trim(),
        type,
        title: title.trim(),
        message: message.trim(),
      });

      if (result?.error || result?.success === false) {
        toast.error(result.message || "Failed to send notification.");
        return;
      }

      toast.success("Notification sent successfully!");
      resetForm();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Send notification error:", error);
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Notification to User</DialogTitle>
          <DialogDescription>
            Send a targeted notification to a specific user by their ID.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* User ID */}
          <div className="space-y-2">
            <Label htmlFor="userId">
              User ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="userId"
              placeholder="e.g., uPTC1ueGCW8Yvwb6lMmJ3HJDT19zk02E"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Find the user ID in the Users page.
            </p>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={type}
              onValueChange={(v) => setType((v ?? "SYSTEM") as NotificationType)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Account Security Alert"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground text-right">
              {title.length}/120
            </p>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Explain the notification..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={1000}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/1000
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Notification"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};