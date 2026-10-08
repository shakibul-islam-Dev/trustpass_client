"use client";

import { CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PasswordRest = () => {
  return (
    <Card className="w-full max-w-lg border-border/80 bg-surface shadow-surface">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Password reset</CardTitle>
            <CardDescription>Secure account recovery</CardDescription>
          </div>
          <Badge variant="success" className="gap-1.5">
            <ShieldCheck className="size-3.5" />
            Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-border bg-background/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Password status</p>
              <p className="text-sm text-muted-foreground">Your account is protected and ready.</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            New password
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              placeholder="••••••••"
              className="h-11 w-full rounded-xl border border-border bg-background/60 pl-10 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Confirm password
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              placeholder="••••••••"
              className="h-11 w-full rounded-xl border border-border bg-background/60 pl-10 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
            />
          </div>
        </div>

        <Button type="button" className="w-full">
          Reset password
        </Button>
      </CardContent>
    </Card>
  );
};

export default PasswordRest;
