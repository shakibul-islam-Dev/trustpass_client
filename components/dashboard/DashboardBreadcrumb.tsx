"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { homeForRole, roleLabel, type ApiRole } from "@/lib/core/roles";
import { roleSidebars } from "@/lib/sidebarData";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** "user-management" -> "User Management". */
function humanize(segment: string) {
  return segment
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

interface Crumb {
  label: string;
  href: string;
}

/**
 * Route-aware breadcrumb for the dashboard shell.
 *
 * The trail is derived from the current URL (never hard-coded), so every role
 * and every nested page gets an accurate path. Labels come from the role's
 * sidebar entries when a route is listed there, and are humanised otherwise.
 */
export default function DashboardBreadcrumb({ role }: { role: ApiRole }) {
  const pathname = usePathname();
  const home = homeForRole(role);
  const sidebarItems = roleSidebars[role]?.items ?? [];

  // Path after "/dashboard", e.g. ["seller", "products", "123"].
  const segments = pathname.split("/").filter(Boolean).slice(1);

  const crumbs: Crumb[] = [{ label: "Dashboard", href: home }];

  segments.forEach((segment, index) => {
    const fullHref = `/dashboard/${segments.slice(0, index + 1).join("/")}`;
    const match = sidebarItems.find((item) => item.href === fullHref);

    let label: string;
    if (fullHref === home) {
      label = capitalize(roleLabel(role));
    } else if (match) {
      label = match.name;
    } else if (UUID_PATTERN.test(segment)) {
      label = "Details";
    } else {
      label = humanize(segment);
    }

    crumbs.push({ label, href: fullHref });
  });

  // Collapse consecutive crumbs that render the same label.
  const deduped = crumbs.filter(
    (crumb, index) => index === 0 || crumb.label !== crumbs[index - 1].label,
  );

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap">
        {deduped.map((crumb, index) => {
          const isLast = index === deduped.length - 1;

          return (
            <Fragment key={`${crumb.href}-${crumb.label}`}>
              <BreadcrumbItem className="min-w-0">
                {isLast ? (
                  <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={<Link href={crumb.href} />}
                    className="truncate"
                  >
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="shrink-0" />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
