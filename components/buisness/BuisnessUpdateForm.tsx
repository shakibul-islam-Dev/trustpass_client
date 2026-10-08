"use client";

import {
  Building2,
  Camera,
  CheckCircle2,
  FileText,
  Globe,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
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

const fieldGroups = [
  [{ label: "Business name", value: "Northstar Home Goods", icon: Building2 }, { label: "Business email", value: "hello@northstarhq.com", icon: FileText }],
  [{ label: "Phone number", value: "+880 1700 123456", icon: Phone }, { label: "Website", value: "www.northstarhq.com", icon: Globe }],
];

export default function BuisnessUpdateForm() {
  return (
    <Card className="border-border/80 bg-surface shadow-surface">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Update business profile</CardTitle>
            <CardDescription>Keep your public details accurate and current.</CardDescription>
          </div>

          <div className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="size-4" />
            Profile ready to publish
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background/50 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Building2 className="size-7" />
              </div>
              <button
                type="button"
                className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-surface"
                aria-label="Upload business logo"
              >
                <Camera className="size-4" />
              </button>
            </div>

            <div>
              <p className="text-lg font-semibold text-foreground">Northstar Home Goods</p>
              <p className="text-sm text-muted-foreground">Verified business account</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="success">Approved</Badge>
            <Badge variant="outline">Updated today</Badge>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {fieldGroups.flat().map(({ label, value, icon: Icon }) => (
            <div key={label} className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {label}
              </Label>
              <div className="relative">
                <Icon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  defaultValue={value}
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
              defaultValue="House 12, Road 7, Dhanmondi, Dhaka 1205, Bangladesh"
              className="min-h-24 w-full rounded-xl border border-border bg-background/60 px-3.5 py-3 pl-10 text-sm text-foreground shadow-sm outline-none"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background/50 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Verification requirements</p>
              <p className="text-sm text-muted-foreground">Trade license, NID, and supporting documents are up to date.</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-success">
              <ShieldCheck className="size-4" />
              3 of 3 checked
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="button" className="gap-2">
            <Save className="size-4" />
            Save changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
