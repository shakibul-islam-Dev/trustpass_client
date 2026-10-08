"use client";

import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const DashboardStarCard = () => {
  return (
    <Card className="border-border/80 bg-surface shadow-surface">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Seller trust score</CardTitle>
            <CardDescription>Public performance indicator</CardDescription>
          </div>
          <Badge variant="success">Excellent</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-end gap-3">
          <span className="text-4xl font-bold tracking-tight text-foreground">4.8</span>
          <span className="pb-1 text-sm text-muted-foreground">out of 5</span>
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={`size-5 ${index < 4 ? "fill-current text-warning" : "text-border"}`}
            />
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-background/50 p-3 text-sm text-muted-foreground">
          92% of recent buyers rated this seller as reliable and responsive.
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardStarCard;
