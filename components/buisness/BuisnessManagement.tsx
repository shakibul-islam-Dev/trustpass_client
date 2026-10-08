"use client";

import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Camera,
  CheckCircle2,
  FileText,
  Globe,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
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

const quickStats = [
  { label: "Trust score", value: "94/100", accent: "success" as const },
  { label: "Verified docs", value: "5/6", accent: "primary-soft" as const },
  { label: "Response rate", value: "96%", accent: "warning" as const },
];

const contactFields = [
  { label: "Business name", value: "Northstar Home Goods" },
  { label: "Business email", value: "hello@northstarhq.com" },
  { label: "Phone number", value: "+880 1700 123456" },
  { label: "Website", value: "www.northstarhq.com" },
  { label: "Facebook page", value: "facebook.com/northstarhq" },
  { label: "Instagram", value: "instagram.com/northstarhq" },
];

const documentItems = [
  { label: "Trade license", status: "Approved", tone: "success" as const },
  { label: "TIN certificate", status: "Reviewing", tone: "warning" as const },
  { label: "National ID", status: "Verified", tone: "success" as const },
];

export default function BuisnessManagement() {
  return (
    <div className="space-y-6 p-4 md:p-6 xl:p-8">
      <Card className="overflow-hidden border-border/80 bg-surface shadow-surface">
        <CardContent className="p-0">
          <div className="flex flex-col gap-6 border-b border-border/80 bg-gradient-to-r from-primary/5 via-background to-surface p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-xl font-semibold text-primary-foreground shadow-surface">
                  <Building2 className="size-8" />
                </div>
                <button
                  type="button"
                  className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-surface transition-colors hover:bg-surface-secondary"
                  aria-label="Upload business logo"
                >
                  <Camera className="size-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    Northstar Home Goods
                  </h1>
                  <Badge variant="success" className="gap-1.5">
                    <BadgeCheck className="size-3.5" />
                    Verified
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Furniture and home accessories • 2,400 products listed
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" className="gap-2">
                <Globe className="size-4" />
                Public page
              </Button>
              <Button type="button" className="gap-2">
                <ShieldCheck className="size-4" />
                Update details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {quickStats.map(({ label, value, accent }) => (
          <Card key={label} className="border-border/80 bg-surface shadow-surface">
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
              </div>
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full ${
                  accent === "success"
                    ? "bg-success/10 text-success"
                    : accent === "warning"
                      ? "bg-warning/10 text-warning"
                      : "bg-primary/10 text-primary"
                }`}
              >
                <Star className="size-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border-border/80 bg-surface shadow-surface">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Business profile</CardTitle>
                <CardDescription>Public information buyers will see.</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              {contactFields.map(({ label, value }) => (
                <div key={label} className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {label}
                  </Label>
                  <div className="relative">
                    {label.includes("Phone") ? (
                      <Phone className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    ) : label.includes("Website") || label.includes("Facebook") || label.includes("Instagram") ? (
                      <Globe className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    ) : (
                      <Building2 className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    )}
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
                Business address
              </Label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-muted-foreground" />
                <textarea
                  readOnly
                  value="House 12, Road 7, Dhanmondi, Dhaka 1205, Bangladesh"
                  className="min-h-24 w-full rounded-xl border border-border bg-background/60 px-3.5 py-3 pl-10 text-sm text-foreground shadow-sm outline-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-surface shadow-surface">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Verification</CardTitle>
                <CardDescription>Document status overview.</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {documentItems.map(({ label, status, tone }) => (
              <div key={label} className="rounded-xl border border-border bg-background/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="size-4" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                  </div>
                  <Badge variant={tone}>{status}</Badge>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" className="w-full gap-2">
              <ArrowUpRight className="size-4" />
              Upload supporting document
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 bg-surface shadow-surface">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>Keep your business profile active and trusted.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-3">
          <Button type="button" className="gap-2">
            <CheckCircle2 className="size-4" />
            Save changes
          </Button>
          <Button type="button" variant="outline" className="gap-2">
            <FileText className="size-4" />
            Preview listing
          </Button>
          <Button type="button" variant="outline" className="gap-2">
            <Phone className="size-4" />
            Contact support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
