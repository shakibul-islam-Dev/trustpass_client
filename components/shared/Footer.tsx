'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { homeForRole } from '@/lib/core/roles';

export default function Footer() {
  const path = usePathname();
  const { role, isAuthenticated } = useAuth();

  if (path.startsWith('/dashboard')) {
    return null;
  }

  const isStaff = role === 'MODERATOR' || role === 'ADMIN';

  return (
    <footer className="border-t border-border bg-card font-sans text-foreground transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          
          {/* Brand & Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
                TP
              </span>
              <span className="text-lg font-bold tracking-tight text-foreground">
                Trust<span className="text-primary">Pass</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-muted-foreground">
              The verified business directory. We validate legitimacy, monitor reviews, and calculate genuine Trust Scores so buyers and vendors transact with confidence.
            </p>
          </div>

          {/* Marketplace Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Marketplace
            </h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/businesses" className="text-muted-foreground transition hover:text-foreground">
                  Browse All Businesses
                </Link>
              </li>
              <li>
                <Link href="/businesses?sort=trustScore" className="text-muted-foreground transition hover:text-foreground">
                  Top Trust Score Rankings
                </Link>
              </li>
              <li>
                <Link href="/businesses?category=ecommerce" className="text-muted-foreground transition hover:text-foreground">
                  E-Commerce & Retail
                </Link>
              </li>
              <li>
                <Link href="/businesses?category=services" className="text-muted-foreground transition hover:text-foreground">
                  Professional Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Staff Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Trust & Governance
            </h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/dashboard/customer/reports" className="text-muted-foreground transition hover:text-foreground">
                  File a Business Complaint
                </Link>
              </li>
              {isStaff && (
                <>
                  <li>
                    <Link href="/dashboard/moderator/verification-queue" className="text-muted-foreground transition hover:text-foreground">
                      Moderator Queue (Staff)
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/moderator/reports" className="text-muted-foreground transition hover:text-foreground">
                      Report Review Center
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Portals Link */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Portals
            </h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link 
                  href={isAuthenticated ? homeForRole(role) : '/auth/login'} 
                  className="text-muted-foreground transition hover:text-foreground"
                >
                  {isAuthenticated ? 'My Dashboard' : 'Sign In'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} TrustPass. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}