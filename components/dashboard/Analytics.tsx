"use client";

import { BarChart3, CreditCard, ShoppingBag, TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const stats = [
  { label: "Total sales", value: "৳48.2k", change: "+12.4%", icon: CreditCard },
  { label: "Orders", value: "1,284", change: "+8.1%", icon: ShoppingBag },
  { label: "Traffic", value: "34.8k", change: "+19.3%", icon: TrendingUp },
];

const Analytics = () => {
  return (
    <Card className="border-border/80 bg-surface shadow-surface">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Performance</CardTitle>
            <CardDescription>Sales snapshot</CardDescription>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BarChart3 className="size-4" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 md:grid-cols-3">
        {stats.map(({ label, value, change, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-border bg-background/50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </div>
            </div>
            <p className="mt-4 text-2xl font-semibold text-foreground">{value}</p>
            <p className="mt-2 text-sm text-success">{change} vs last month</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default Analytics;
