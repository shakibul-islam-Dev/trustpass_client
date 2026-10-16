"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {useState } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
  className?: string;
  onClick?: () => void;
}

export const NavLink = ({
  href,
  children,
  exact = false,
  className,
  onClick,
}: NavLinkProps) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

 

  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "relative transition-colors hover:text-primary",
        isActive && "text-primary font-semibold",
        className
      )}
    >
      {children}
      {mounted && isActive && (
        <span className="hidden md:block absolute -bottom-[21px] left-0 right-0 h-0.5 bg-primary" />
      )}
    </Link>
  );
};