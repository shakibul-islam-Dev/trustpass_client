import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="text-6xl font-extrabold text-primary">404</h1>
      <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Could not find requested resource or page.
      </p>
      <Link
        href="/"
        className="rounded-field bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus/40"
      >
        Return Home
      </Link>
    </div>
  );
}
