"use client";

import { BriefcaseBusiness } from "lucide-react";

export interface BusinessCategoryOption {
  id: string;
  name: string;
  description?: string | null;
}

interface CategorySelectorProps {
  value: string;
  onChange: (category: string) => void;
  categories: BusinessCategoryOption[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function CategorySelector({
  value,
  onChange,
  categories,
  isLoading = false,
  error,
  onRetry,
}: CategorySelectorProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-foreground">Choose a business category</legend>
      {isLoading ? (
        <div role="status" className="rounded-xl border border-border bg-background/40 p-4 text-sm text-muted-foreground">
          Loading available categories…
        </div>
      ) : error ? (
        <div className="rounded-xl border border-danger/30 bg-danger/5 p-4">
          <p role="alert" className="text-sm text-danger">{error}</p>
          {onRetry && <button type="button" onClick={onRetry} className="mt-2 text-sm font-medium text-primary underline-offset-4 hover:underline">Try again</button>}
        </div>
      ) : categories.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">No business categories are available yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
        {categories.map(({ id, name, description }) => {
          const isSelected = value === id;

          return (
            <button
              key={id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(id)}
              className={`flex min-h-20 items-center gap-3 rounded-xl border p-3 text-left transition-[border-color,background-color,box-shadow] duration-150 ${
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border bg-surface hover:border-primary/40 hover:bg-surface-secondary"
              }`}
            >
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${isSelected ? "bg-primary text-primary-foreground" : "bg-surface-secondary text-muted-foreground"}`}>
                <BriefcaseBusiness className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{name}</span>
                {description && <span className="mt-1 block text-xs text-muted-foreground">{description}</span>}
              </span>
            </button>
          );
        })}
        </div>
      )}
    </fieldset>
  );
}
