"use client";

import { AlertTriangle, FileText, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const DashboardModal = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md border-border/80 bg-surface shadow-overlay">
        <CardHeader className="relative pb-3">
          <button
            type="button"
            aria-label="Close modal"
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/60 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/10 text-warning">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <CardTitle>Review alert</CardTitle>
              <CardDescription>Action needed from seller dashboard</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="rounded-2xl border border-border bg-background/50 p-4">
            <div className="flex items-center gap-3">
              <FileText className="size-4 text-primary" />
              <p className="font-medium text-foreground">New business verification issue</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              A supplier document was rejected. Please upload a corrected trade license to continue.
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline">
              Dismiss
            </Button>
            <Button type="button">Resolve</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardModal;
