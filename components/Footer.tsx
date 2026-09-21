
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-foreground font-sans text-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          
          {/* Brand info & Trust Statement */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
                TP
              </span>
              <span className="text-lg font-bold tracking-tight text-background">
                Trust<span className="text-primary">Pass</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-background/70">
              The verified business directory. We validate legitimacy, monitor reviews, 
              and calculate genuine Trust Scores so buyers and vendors transact with confidence.
            </p>
          </div>

          {/* Directory & Marketplace Links (Saheen's Area) */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background">
              Marketplace
            </h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/businesses" className="transition hover:text-background">
                  Browse All Businesses
                </Link>
              </li>
              <li>
                <Link href="/businesses?sort=trustScore" className="transition hover:text-background">
                  Top Trust Score Rankings
                </Link>
              </li>
              <li>
                <Link href="/businesses?category=ecommerce" className="transition hover:text-background">
                  E-Commerce & Retail
                </Link>
              </li>
              <li>
                <Link href="/businesses?category=services" className="transition hover:text-background">
                  Professional Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Verification & Trust System */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background">
              Trust & Governance
            </h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/trust-scoring-methodology" className="transition hover:text-background">
                  How Trust Score Works
                </Link>
              </li>
              <li>
                <Link href="/moderator/verifications" className="transition hover:text-background">
                  Moderator Queue (Staff)
                </Link>
              </li>
              <li>
                <Link href="/moderator/reports" className="transition hover:text-background">
                  Report Review Center
                </Link>
              </li>
              <li>
                <Link href="/customer/report" className="transition hover:text-background">
                  File a Business Complaint
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals (Connecting Shakibul & Aritro's Modules) */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background">
              Portals
            </h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/dashboard/business" className="transition hover:text-background">
                  Business Owner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/buyer" className="transition hover:text-background">
                  Buyer Account
                </Link>
              </li>
              <li>
                <Link href="/admin/analytics" className="transition hover:text-background">
                  System Admin
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-10 flex flex-col items-center justify-between border-t border-background/20 pt-6 text-xs text-background/60 sm:flex-row">
          <p>© {new Date().getFullYear()} TrustPass. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Link href="/privacy" className="hover:text-background/80">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-background/80">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}