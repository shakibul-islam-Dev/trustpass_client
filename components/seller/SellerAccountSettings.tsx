"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, LogOut, ShieldCheck, UserCog } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { roleLabel } from "@/lib/core/roles";
import { signOut } from "@/lib/core/session";
import SellerEmptyState from "./SellerEmptyState";
import SellerPageHeader from "./SellerPageHeader";
import SellerStatusBadge from "./SellerStatusBadge";

/**
 * Account & security settings. Reads the signed-in user straight from the
 * session. Notification toggles are kept on this device only until an
 * preferences API exists.
 */
export default function SellerAccountSettings() {
  const router = useRouter();
  const { user, isPending } = useAuth();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState({
    orderEmails: true,
    productUpdates: false,
    securityAlerts: true,
  });

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await signOut();
    router.replace("/auth/login");
    router.refresh();
  };

  const initials =
    (user?.name ?? "").trim().split(/\s+/).filter(Boolean).slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?";

  if (isPending) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6" role="status">
        <div className="h-40 w-full animate-pulse rounded-2xl bg-muted" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <SellerEmptyState
          icon={UserCog}
          title="Signed out"
          description="Sign in to view and manage your account settings."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <SellerPageHeader
        icon={UserCog}
        title="Account & security"
        description="Manage your account details, password, and sign-in options."
      />

      <Card className="border-border/80 bg-surface shadow-surface">
        <CardHeader>
          <div className="flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
              {initials}
            </span>
            <div>
              <CardTitle>{user.name || "Seller account"}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Role
              </dt>
              <dd className="mt-1">
                <SellerStatusBadge status={roleLabel(user.role)} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Email verified
              </dt>
              <dd className="mt-1">
                <SellerStatusBadge status={user.emailVerified ? "Verified" : "Pending"} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Phone
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{user.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Account status
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {user.status || "Active"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-border/80 bg-surface shadow-surface">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Keep your sign-in safe.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/dashboard/change-password"
              className={buttonVariants({ variant: "outline", size: "sm", className: "w-full gap-2" })}
            >
              <KeyRound className="size-4" />
              Change password
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-danger hover:border-danger/40"
              disabled={isLoggingOut}
              onClick={() => void handleSignOut()}
            >
              <LogOut className="size-4" />
              {isLoggingOut ? "Signing out…" : "Sign out"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-surface shadow-surface">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Saved on this device only until a preferences API is available.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                key: "orderEmails" as const,
                label: "Order emails",
                description: "Get an email when a customer places an order.",
              },
              {
                key: "productUpdates" as const,
                label: "Product updates",
                description: "Tips and news about your catalog and listings.",
              },
              {
                key: "securityAlerts" as const,
                label: "Security alerts",
                description: "Warn me about sign-ins and account changes.",
              },
            ].map((setting) => (
              <div
                key={setting.key}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background/40 p-4"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{setting.label}</p>
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
                <Switch
                  checked={notifications[setting.key]}
                  onCheckedChange={(checked) =>
                    setNotifications((current) => ({ ...current, [setting.key]: checked }))
                  }
                  aria-label={setting.label}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}