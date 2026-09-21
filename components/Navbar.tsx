'use client';
import Link from 'next/link';

export default function Navbar() {
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

          {/* Core Navigation Links */}
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <Link href="/businesses" className="transition-colors hover:text-primary">
              Explore Businesses
            </Link>
            <Link href="/businesses?verified=true" className="transition-colors hover:text-primary">
              Verified Only
            </Link>
            {/* Quick access to your Moderator scope */}
            <Link href="/moderator/verifications" className="transition-colors hover:text-primary">
              Moderator Queue
            </Link>
          </nav>
        </div>

        {/* Global Quick Search (Marketplace Integration) */}
        <div className="hidden lg:block w-72">
          <form className="relative">
            <input
              type="text"
              placeholder="Search companies, services..."
              className="w-full rounded-full border border-input bg-muted py-1.5 pl-4 pr-9 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none"            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        {/* Auth / Action Buttons (Connecting to Shakibul & Shajida's scope) */}
        <div className="hidden sm:flex items-center gap-3">
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

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

    </header>
  );
}