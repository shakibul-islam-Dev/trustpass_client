"use client";

import { Boxes, ShoppingBag, Truck, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SellerEmptyState from "./SellerEmptyState";
import SellerPageHeader from "./SellerPageHeader";

/** Order management. Not wired to an API yet, so it shows a helpful placeholder. */
export default function SellerOrders() {
  const comingSoon = [
    {
      icon: Boxes,
      title: "Order tracking",
      description: "See new orders as they come in and follow them to delivery.",
    },
    {
      icon: Truck,
      title: "Fulfilment",
      description: "Mark orders as processing, shipped, or delivered from one place.",
    },
    {
      icon: Users,
      title: "Customer details",
      description: "Review the buyer's name, shipping address, and contact info.",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <SellerPageHeader
        icon={ShoppingBag}
        title="Orders"
        badge="Coming soon"
        description="A central place to track and fulfil orders from your customers."
      />

      <SellerEmptyState
        icon={ShoppingBag}
        title="Orders aren't connected yet"
        description="The order management API is still being built. Once it is live, your orders and their delivery status will appear here automatically."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {comingSoon.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.title}
              className="border-border/80 bg-surface shadow-surface transition-colors hover:border-primary/30"
            >
              <CardHeader>
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <CardTitle className="mt-3">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs font-medium text-muted-foreground">
                  Available as soon as the feature ships.
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}