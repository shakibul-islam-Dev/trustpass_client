"use client";

import {
  ArrowRight,
  MessageSquareText,
  Star,
  ThumbsUp,
  UploadCloud,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const reviewTags = ["On-time delivery", "Friendly support", "Fair pricing"];

export default function Comments() {
  return (
    <Card className="w-full max-w-xl border-border/80 bg-surface shadow-surface">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareText className="size-4 text-primary" />
              Customer review
            </CardTitle>
            <CardDescription>Share feedback from the latest buyer interaction.</CardDescription>
          </div>
          <Badge variant="success" className="gap-1.5">
            <Star className="size-3.5" />
            4.8 / 5
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-border bg-background/50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Reviewed by</p>
              <p className="text-base font-semibold text-foreground">Rafi Karim</p>
            </div>
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <ThumbsUp className="size-4" />
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Product quality exceeded expectations. The seller responded quickly, packaging was tidy,
            and the delivery timeline was reliable. I would definitely order again.
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Highlights
          </Label>
          <div className="flex flex-wrap gap-2">
            {reviewTags.map((tag) => (
              <Badge key={tag} variant="outline" className="rounded-full border-border/80 bg-surface-secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Reply or note
          </Label>
          <Textarea
            placeholder="Write a thoughtful response to the customer..."
            className="min-h-28 rounded-xl border-border/80 bg-background/60 shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UploadCloud className="size-4" />
            Included in trust profile
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline">
              Save draft
            </Button>
            <Button type="button" className="gap-2">
              Submit review
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
