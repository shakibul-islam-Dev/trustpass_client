'use client';
import ToggleBar from './ToggleBar/ToggleBar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
export default function Navbar() {
  const path = usePathname();
  if(path.startsWith('/dashboard')) {
    return null;
  }
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 font-sans backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Brand / Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground shadow-sm">
              TP
            </span>

            <span className="text-xl font-bold tracking-tight text-foreground">
              Trust<span className="text-primary">Pass</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <Link
              href="/"
              className="transition-colors hover:text-primary"
            >
              Home
            </Link>

            <Link
              href="/businessesExplore"
              className="transition-colors hover:text-primary"
            >
              Explore Businesses
            </Link>

            <Link
              href="/businesses?verified=true"
              className="transition-colors hover:text-primary"
            >
              Verified Only
            </Link>

            <Link
              href="/moderator/verifications"
              className="transition-colors hover:text-primary"
            >
              Moderator Queue
            </Link>
          </nav>
        </div>
        {/* Toggle Theme Button */}
        <div>
          <ToggleBar />
        </div>
        {/* Auth / Action Buttons */}
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/auth/login"
            className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Sign In
          </Link>

          <Link
            href="/business/register"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            List Your Business
          </Link>
        </div>
        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button className="rounded-md p-2 text-muted-foreground hover:bg-muted">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

      </div>
    </header>
  );
}
