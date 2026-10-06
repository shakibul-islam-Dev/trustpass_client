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
    <footer className="border-t border-neutral-800 bg-neutral-950 font-sans text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white font-bold text-neutral-950">TP</span>
              <span className="text-lg font-bold tracking-tight text-white">Trust<span className="text-sky-400">Pass</span></span>
            </div>
            <p className="text-xs leading-relaxed text-neutral-400">
              The verified business directory. We validate legitimacy, monitor reviews, and calculate genuine Trust Scores so buyers and vendors transact with confidence.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Marketplace</h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li><Link href="/businesses" className="text-neutral-300 transition hover:text-white">Browse All Businesses</Link></li>
              <li><Link href="/businesses?sort=trustScore" className="text-neutral-300 transition hover:text-white">Top Trust Score Rankings</Link></li>
              <li><Link href="/businesses?category=ecommerce" className="text-neutral-300 transition hover:text-white">E-Commerce & Retail</Link></li>
              <li><Link href="/businesses?category=services" className="text-neutral-300 transition hover:text-white">Professional Services</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Trust & Governance</h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li><Link href="/dashboard/customer/reports" className="text-neutral-300 transition hover:text-white">File a Business Complaint</Link></li>
              {/* Staff-only. Previously these were plain links, so every
                  anonymous visitor saw a "Moderator Queue (Staff)" link that
                  bounced them to sign-in. */}
              {isStaff && (
                <>
                  <li><Link href="/dashboard/moderator/verification-queue" className="text-neutral-300 transition hover:text-white">Moderator Queue (Staff)</Link></li>
                  <li><Link href="/dashboard/moderator/reports" className="text-neutral-300 transition hover:text-white">Report Review Center</Link></li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Portals</h4>
            <ul className="mt-4 space-y-2 text-xs">
              {/* One link, pointing at whichever dashboard this account
                  actually has. The old list advertised /dashboard/business,
                  /dashboard/buyer and /admin/analytics — none of which exist,
                  so all three were 404s. */}
              <li>
                <Link href={isAuthenticated ? homeForRole(role) : '/auth/login'} className="text-neutral-300 transition hover:text-white">
                  {isAuthenticated ? 'My Dashboard' : 'Sign In'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between border-t border-neutral-800 pt-6 text-xs text-neutral-400 sm:flex-row">
          <p>© {new Date().getFullYear()} TrustPass. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
