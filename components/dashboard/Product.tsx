"use client";

import { ImageIcon, PencilLine, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Product = () => {
  return (
    <Card className="border-border/80 bg-surface shadow-surface">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>Premium Lamp</CardTitle>
            <CardDescription>Home decor • In stock</CardDescription>
          </div>
          <Badge variant="success">Live</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-border bg-background/50 text-muted-foreground">
          <ImageIcon className="size-8" />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Price</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">৳2,490</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Stock</p>
            <p className="mt-1 text-base font-medium text-foreground">120 units</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1 gap-2">
            <PencilLine className="size-4" />
            Edit
          </Button>
          <Button type="button" variant="destructive" className="flex-1 gap-2">
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Product;
