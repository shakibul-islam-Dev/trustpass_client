"use client";

import Link from "next/link";
import {
  Building2,
  ChevronRight,
  CreditCard,
  KeyRound,
  Palette,
  Settings,
  UserCog,
  UserRound,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SellerPageHeader from "./SellerPageHeader";

const settingsLinks = [
  {
    title: "Profile",
    description: "Your photo, name, contact details, and social links.",
    href: "/dashboard/seller/settings/profile",
    icon: UserRound,
  },
  {
    title: "Business profile",
    description: "Create or edit your business details, address, and documents.",
    href: "/dashboard/seller/settings/buisnessform",
    icon: Building2,
  },
  {
    title: "Account & security",
    description: "Account details, security, and signing out.",
    href: "/dashboard/seller/settings/account",
    icon: UserCog,
  },
  {
    title: "Appearance",
    description: "Theme (light or dark) and visual preferences.",
    href: "/dashboard/seller/settings/appearance",
    icon: Palette,
  },
  {
    title: "Change password",
    description: "Update the password used to sign in.",
    href: "/dashboard/change-password",
    icon: KeyRound,
  },
  {
    title: "Payments",
    description: "Fee payments and transaction history.",
    href: "/dashboard/seller/payments",
    icon: CreditCard,
  },
];

/** Settings hub for sellers — one card per settings area. */
export default function SellerSettingsHub() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <SellerPageHeader
        icon={Settings}
        title="Settings"
        description="Manage your profile, account security, and how the dashboard looks for you."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {settingsLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
            >
              <Card className="h-full border-border/80 bg-surface shadow-surface transition-colors hover:border-primary/40 hover:bg-surface-secondary/60">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="mt-3">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs font-medium text-primary">Open settings</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}