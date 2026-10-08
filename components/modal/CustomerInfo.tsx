"use client";

import {
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  TrendingUp,
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

const contactInfo = [
  { label: "Email", value: "rafi.karim@gmail.com", icon: Mail },
  { label: "Phone", value: "+880 1712 453211", icon: Phone },
  { label: "Address", value: "House 8, Gulshan Avenue, Dhaka", icon: MapPin },
];

export default function CustomerInfo() {
  return (
    <Card className="w-full max-w-2xl border-border/80 bg-surface shadow-surface">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-lg font-semibold text-primary-foreground">
              RK
            </div>
            <div>
              <CardTitle>Rafi Karim</CardTitle>
              <CardDescription>Verified buyer • Joined 3 months ago</CardDescription>
            </div>
          </div>
          <Badge variant="success" className="gap-1.5">
            <ShieldCheck className="size-3.5" />
            Trusted
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-background/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Orders</p>
            <p className="mt-3 text-2xl font-semibold text-foreground">128</p>
          </div>
          <div className="rounded-2xl border border-border bg-background/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Ratings</p>
            <p className="mt-3 text-2xl font-semibold text-foreground">4.9</p>
          </div>
          <div className="rounded-2xl border border-border bg-background/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Response</p>
            <p className="mt-3 text-2xl font-semibold text-foreground">98%</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background/50 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <UserRound className="size-4 text-primary" />
              <p className="font-medium text-foreground">Contact details</p>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="size-4 fill-current" />
              <span className="text-sm font-medium text-foreground">Top buyer</span>
            </div>
          </div>

          <div className="space-y-3">
            {contactInfo.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border border-border/80 bg-surface px-3 py-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background/50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="size-4 text-success" />
            <p className="font-medium text-foreground">Trust trend</p>
          </div>
          <div className="flex items-end gap-3">
            {[30, 45, 58, 66, 84, 94].map((height, index) => (
              <div key={height} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={`w-full rounded-t-xl ${index >= 4 ? "bg-primary" : "bg-primary/60"}`}
                  style={{ height: `${height}px` }}
                />
                <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {"M"}
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button type="button" variant="outline">Contact buyer</Button>
          <Button type="button" className="gap-2">
            <CheckCircle2 className="size-4" />
            Mark as trusted
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
