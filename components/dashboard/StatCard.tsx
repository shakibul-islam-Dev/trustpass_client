"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

export interface StatItem {
  id: string;
  value: string;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  /** Optional second line under the label (hint or a "pending" notice). */
  caption?: string;
}

interface StatCardsProps {
  /** Metrics to render. Real values where the backend supports them. */
  items?: StatItem[];
}

const StatCards = ({ items = [] }: StatCardsProps) => {
  // Match the column count to the number of cards. The old fixed 4-column grid
  // left an empty trailing slot whenever fewer than four cards were supplied
  // (e.g. the seller overview has 3), so the row looked like it wasn't full width.
  const columnsClass =
    items.length === 1
      ? "sm:grid-cols-1"
      : items.length === 2
        ? "sm:grid-cols-2"
        : items.length === 3
          ? "sm:grid-cols-3"
          : "sm:grid-cols-2 xl:grid-cols-4";

  return (
    <div className={`grid w-full grid-cols-1 gap-5 ${columnsClass}`}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className="bg-surface rounded-2xl p-5 border border-border shadow-surface flex h-full items-center gap-4 transition-all hover:shadow-overlay"
          >
            {/* Circular Icon Wrapper */}
            <div
              className={`w-14 h-14 rounded-full ${item.bgColor} flex items-center justify-center shrink-0`}
            >
              <Icon className={`w-6 h-6 ${item.iconColor}`} />
            </div>

            {/* Content */}
            <div className="flex flex-col min-w-0">
              <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                {item.value}
              </h3>
              <p className="text-sm font-medium text-muted-foreground mt-0.5">
                {item.label}
              </p>
              {item.caption && (
                <p className="text-xs text-muted-foreground/80 mt-0.5">{item.caption}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatCards;
