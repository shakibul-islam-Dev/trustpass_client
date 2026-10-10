"use client";

import { useState } from "react";
import { Bell, Send, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SendNotificationModal } from "@/components/admin/notification-management/SendNotificationModal";
import { BroadcastNotificationModal } from "@/components/admin/notification-management/BroadcastNotificationModal";

/**
 * Emergency implementation by: Aritro
 * Reason: Admin/Moderator notification send/broadcast UI was unassigned.
 * Backend endpoints already exist (see notification.routes.ts).
 * To be reviewed by the team lead / Shakibul.
 */
export default function AdminNotificationsPage() {
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Notification Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Send notifications to specific users, or broadcast to all users.
        </p>
      </div>

      {/* Two big action cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Send to specific user */}
        <Card className="border-border/80 hover:border-primary/40 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <Send className="h-6 w-6" />
              </span>
              <div>
                <CardTitle>Send to User</CardTitle>
                <CardDescription>
                  Send a targeted notification to a specific user by their ID.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              size="lg"
              onClick={() => setIsSendOpen(true)}
            >
              <Send className="mr-2 h-4 w-4" />
              Send to User
            </Button>
          </CardContent>
        </Card>

        {/* Broadcast */}
        <Card className="border-border/80 hover:border-primary/40 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                <Megaphone className="h-6 w-6" />
              </span>
              <div>
                <CardTitle>Broadcast</CardTitle>
                <CardDescription>
                  Send a notification to all users, or a specific subset.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              size="lg"
              variant="secondary"
              onClick={() => setIsBroadcastOpen(true)}
            >
              <Megaphone className="mr-2 h-4 w-4" />
              Broadcast Notification
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info box */}
      <Card className="border-border/60 bg-muted/30">
        <CardContent className="p-5 flex items-start gap-3">
          <Bell className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong className="text-foreground">Send to User</strong> — sends
              one notification to a single user. User ID can be found on the{" "}
              <span className="text-primary">Users</span> page.
            </p>
            <p>
              <strong className="text-foreground">Broadcast</strong> — sends to
              all users by default, or only to a specific list of user IDs.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <SendNotificationModal
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
      />
      <BroadcastNotificationModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
      />
    </div>
  );
}