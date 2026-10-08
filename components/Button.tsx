"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button as UiButton } from "@/components/ui/button";

interface DashboardButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg" | "xs";
}

const Button = ({ children, variant = "default", size = "default", className, ...props }: DashboardButtonProps) => {
  return (
    <UiButton variant={variant} size={size} className={className} {...props}>
      {children}
    </UiButton>
  );
};

export default Button;
