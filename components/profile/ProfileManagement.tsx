"use client";

import {
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  FileText,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const detailRows = [
  { label: "Full name", value: "Shakibul Islam", icon: UserRound },
  { label: "Email address", value: "shakibul@trustpass.io", icon: Mail },
  { label: "Phone number", value: "+880 1712 345678", icon: Phone },
  { label: "Location", value: "Dhaka, Bangladesh", icon: MapPin },
];

const documentItems = [
  { name: "National ID", status: "Verified", tone: "success" as const },
  { name: "Trade license", status: "Pending", tone: "warning" as const },
  { name: "Business agreement", status: "Uploaded", tone: "primary-soft" as const },
];

export default function ProfileManagement() {
  return (
    <div className="space-y-6 p-4 md:p-6 xl:p-8">
      <Card className="overflow-hidden border-border/80 bg-surface shadow-surface">
        <CardContent className="p-0">
          <div className="flex flex-col gap-6 border-b border-border/80 bg-gradient-to-r from-primary/5 via-background to-surface p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-xl font-semibold text-primary-foreground shadow-surface">
                  SI
                </div>
                <button
                  type="button"
                  className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-surface transition-colors hover:bg-surface-secondary"
                  aria-label="Upload profile photo"
                >
                  <Camera className="size-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    Shakibul Islam
                  </h1>
                  <Badge variant="success">Verified seller</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Business owner · Trusted profile • Last updated 2 days ago
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" className="gap-2">
                <FileText className="size-4" />
                View public profile
              </Button>
              <Button type="button" className="gap-2">
                <ShieldCheck className="size-4" />
                Edit profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border-border/80 bg-surface shadow-surface">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Personal information</CardTitle>
                <CardDescription>Core details used across your trust profile.</CardDescription>
              </div>
              <Badge variant="outline" className="gap-1.5">
                <CheckCircle2 className="size-3.5" />
                98% complete
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              {detailRows.map(({ label, value, icon: Icon }) => (
                <div key={label} className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {label}
                  </Label>
                  <div className="relative">
                    <Icon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      readOnly
                      value={value}
                      className="h-11 rounded-xl border-border/80 bg-background/60 pl-10 text-foreground shadow-sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Bio
              </Label>
              <textarea
                readOnly
                value="Trusted local seller focused on quality household products, reliable deliveries, and friendly customer support."
                className="min-h-28 w-full rounded-xl border border-border bg-background/60 px-3.5 py-3 text-sm text-foreground shadow-sm outline-none"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-surface shadow-surface">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Protect your account and recovery options.</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border bg-background/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Password</p>
                  <p className="text-sm text-muted-foreground">Last changed 18 days ago</p>
                </div>
                <div className="rounded-full bg-success/10 p-2 text-success">
                  <Lock className="size-4" />
                </div>
              </div>
              <Button type="button" variant="outline" className="mt-4 w-full gap-2">
                <Lock className="size-4" />
                Change password
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-background/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Two-step verification</p>
                  <p className="text-sm text-muted-foreground">Recommended for account protection</p>
                </div>
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <ShieldCheck className="size-4" />
                </div>
              </div>
              <Button type="button" variant="outline" className="mt-4 w-full gap-2">
                <ShieldCheck className="size-4" />
                Enable 2FA
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 bg-surface shadow-surface">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Documents & verification</CardTitle>
              <CardDescription>Keep your identity and business records updated.</CardDescription>
            </div>
            <Button type="button" variant="outline" className="gap-2">
              <FileText className="size-4" />
              Upload new document
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-3">
          {documentItems.map(({ name, status, tone }) => (
            <div
              key={name}
              className="rounded-xl border border-border bg-background/50 p-4 transition-colors hover:border-primary/30 hover:bg-surface-secondary"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BriefcaseBusiness className="size-4" />
                  </div>
                  <p className="font-medium text-foreground">{name}</p>
                </div>
                <Badge variant={tone === "success" ? "success" : tone === "warning" ? "warning" : "primary-soft"}>
                  {status}
                </Badge>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {status === "Verified"
                  ? "Approved by TrustPass review team."
                  : status === "Pending"
                    ? "Awaiting review from the verification team."
                    : "Document attached and ready for review."}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
