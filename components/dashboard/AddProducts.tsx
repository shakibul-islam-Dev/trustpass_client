"use client";

import { ImagePlus, Save, Tag } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";

const AddProducts = () => {
  return (
    <Card className="border-border/80 bg-surface shadow-surface">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Add new product</CardTitle>
            <CardDescription>Share product details and pricing</CardDescription>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Tag className="size-4" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="product-name">Product name</Label>
            <Input id="product-name" defaultValue="Minimal desk lamp" className="h-11" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-price">Price</Label>
            <Input id="product-price" defaultValue="৳2,490" className="h-11" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-category">Category</Label>
          <Input id="product-category" defaultValue="Home decor" className="h-11" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-description">Description</Label>
          <Textarea id="product-description" defaultValue="Wooden accent lamp with soft warm glow and compact footprint for modern interiors." className="min-h-28" />
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-background/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">Product image</p>
              <p className="text-sm text-muted-foreground">PNG or JPG up to 5MB</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ImagePlus className="size-4" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button type="button" variant="outline">
            Save draft
          </Button>
          <Button type="button" className="gap-2">
            <Save className="size-4" />
            Publish product
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddProducts;
