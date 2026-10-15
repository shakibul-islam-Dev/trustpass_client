"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface CustomerStatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  colorClass?: string;
}

export const CustomerStatCard = ({
  title,
  value,
  icon: Icon,
  description,
  colorClass = "bg-primary/10 text-primary",
}: CustomerStatCardProps) => {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={`shrink-0 rounded-full p-3 ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};