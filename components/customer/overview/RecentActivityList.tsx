"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flag, Bell, ArrowRight, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import type { IRecentActivity } from "@/lib/customer_api/overview";

interface RecentActivityListProps {
  activities: IRecentActivity[];
  isLoading?: boolean;
}

export const RecentActivityList = ({
  activities,
  isLoading = false,
}: RecentActivityListProps) => {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No recent activity yet.
          </p>
        ) : (
          <div className="space-y-2">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-md border bg-card hover:bg-muted/50 transition-colors"
              >
                {/* Icon */}
                <div
                  className={`p-2 rounded-full shrink-0 ${
                    activity.type === "REPORT"
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-purple-500/10 text-purple-500"
                  }`}
                >
                  {activity.type === "REPORT" ? (
                    <Flag className="h-4 w-4" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium line-clamp-1">
                      {activity.title}
                    </p>
                    {activity.status && (
                      <Badge variant="outline" className="text-[10px]">
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Link */}
                {activity.link && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={() => router.push(activity.link!)}
                  >
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};