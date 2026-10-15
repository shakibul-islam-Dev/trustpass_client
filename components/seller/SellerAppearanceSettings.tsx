"use client";

import { useEffect, useState } from "react";
import { Check, Monitor, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SellerPageHeader from "./SellerPageHeader";

type ThemeOption = "light" | "dark" | "system";

const themeOptions: { value: ThemeOption; label: string; description: string; icon: typeof Sun }[] =
  [
    {
      value: "light",
      label: "Light",
      description: "Bright and airy for daytime use.",
      icon: Sun,
    },
    {
      value: "dark",
      label: "Dark",
      description: "Easy on the eyes in low light.",
      icon: Moon,
    },
    {
      value: "system",
      label: "System",
      description: "Follow your device setting.",
      icon: Monitor,
    },
  ];

const accentSwatches = [
  { name: "Brand blue", className: "bg-primary" },
  { name: "Success", className: "bg-success" },
  { name: "Warning", className: "bg-warning" },
  { name: "Danger", className: "bg-danger" },
];

/** Appearance settings — theme picker plus a live preview of the dashboard look. */
export default function SellerAppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes writes the `dark` class after mount; until then the theme is
  // unknown, so render nothing interactive to avoid a hydration mismatch.
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const activeTheme = (mounted ? theme : "system") as ThemeOption;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <SellerPageHeader
        icon={Palette}
        title="Appearance"
        description="Choose how the dashboard looks on this device."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-border/80 bg-surface shadow-surface">
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>Pick the color mode for the entire dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isActive = activeTheme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={!mounted}
                    onClick={() => setTheme(option.value)}
                    className={`relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none disabled:opacity-60 ${
                      isActive
                        ? "border-primary/60 bg-primary/5"
                        : "border-border bg-background/40 hover:border-primary/30"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3.5" />
                      </span>
                    )}
                    <span className="flex size-9 items-center justify-center rounded-lg bg-surface-secondary text-foreground">
                      <Icon className="size-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-foreground">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-surface shadow-surface">
          <CardHeader>
            <CardTitle>Theme preview</CardTitle>
            <CardDescription>
              Sample styling only; this preview does not show account metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border bg-background/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Business dashboard</p>
                  <p className="mt-0.5 text-base font-semibold text-foreground">
                    Product catalog
                  </p>
                </div>
                <span className="rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                  Preview
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-surface-secondary px-3 py-2">
                <span className="size-2 rounded-full bg-success" />
                <span className="text-xs font-medium text-foreground">Published product</span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background/60 p-4">
              <p className="text-xs font-medium text-muted-foreground">Accent palette</p>
              <div className="mt-2 flex items-center gap-2">
                {accentSwatches.map((swatch) => (
                  <span
                    key={swatch.name}
                    title={swatch.name}
                    className={`size-8 rounded-lg ${swatch.className}`}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                These tones come from the design system and stay consistent in both themes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}