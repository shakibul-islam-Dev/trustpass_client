"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
}

export const NavLink = ({ href, children, exact = false }: NavLinkProps) => {
  const pathname = usePathname();
  
  // Check if current path matches (exact or startsWith)
  const isActive = exact 
    ? pathname === href 
    : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "relative transition-colors hover:text-primary",
        isActive && "text-primary font-semibold"
      )}
    >
      {children}
      {/* Active indicator - bottom border */}
      {isActive && (
        <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-primary" />
      )}
    </Link>
  );
};