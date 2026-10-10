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
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  broadcastNotification,
  type NotificationType,
} from "@/lib/admin_action/notifications_action";

interface BroadcastNotificationModalProps {
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

export const BroadcastNotificationModal = ({
  isOpen,
  onClose,
  onSuccess,
}: BroadcastNotificationModalProps) => {
  const [type, setType] = useState<NotificationType>("SYSTEM");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [userIds, setUserIds] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setType("SYSTEM");
    setTitle("");
    setMessage("");
    setUserIds([]);
    setCurrentUserId("");
  };

  const handleAddUserId = () => {
    const id = currentUserId.trim();
    if (!id) return;
    if (userIds.includes(id)) {
      toast.error("This user ID is already in the list.");
      return;
    }
    setUserIds((prev) => [...prev, id]);
    setCurrentUserId("");
  };

  const handleRemoveUserId = (id: string) => {
    setUserIds((prev) => prev.filter((x) => x !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await broadcastNotification({
        type,
        title: title.trim(),
        message: message.trim(),
        // If empty, omit userIds → backend sends to ALL users
        userIds: userIds.length > 0 ? userIds : undefined,
      });

      if (result?.error || result?.success === false) {
        toast.error(result.message || "Failed to broadcast notification.");
        return;
      }

      toast.success(
        userIds.length > 0
          ? `Broadcast sent to ${userIds.length} user(s).`
          : "Broadcast sent to all users."
      );
      resetForm();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Broadcast error:", error);
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
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Broadcast Notification</DialogTitle>
          <DialogDescription>
            Send a notification to all users, or only a specific subset.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="broadcastType">Type</Label>
            <Select
              value={type}
              onValueChange={(v) => setType((v ?? "SYSTEM") as NotificationType)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="broadcastType">
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
            <Label htmlFor="broadcastTitle">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="broadcastTitle"
              placeholder="e.g., System Maintenance Notice"
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
            <Label htmlFor="broadcastMessage">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="broadcastMessage"
              placeholder="Explain the announcement..."
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

          {/* Optional: Targeted user IDs */}
          <div className="space-y-2">
            <Label htmlFor="userIds">
              Target User IDs{" "}
              <span className="text-muted-foreground text-xs">
                (Optional — leave empty to send to ALL users)
              </span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="userIds"
                placeholder="Enter a user ID..."
                value={currentUserId}
                onChange={(e) => setCurrentUserId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddUserId();
                  }
                }}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddUserId}
                disabled={isSubmitting}
              >
                Add
              </Button>
            </div>

            {userIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {userIds.map((id) => (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="flex items-center gap-1 py-1.5 pl-3 pr-2"
                  >
                    <span className="truncate max-w-[200px] text-xs">
                      {id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveUserId(id)}
                      className="ml-1 hover:text-destructive"
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {userIds.length === 0
                ? "No user IDs added — will send to all users."
                : `${userIds.length} user(s) will receive this notification.`}
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
              {isSubmitting
                ? "Broadcasting..."
                : userIds.length === 0
                ? "Broadcast to All"
                : `Send to ${userIds.length} User(s)`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};