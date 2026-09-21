import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-6xl font-extrabold text-slate-900">404</h1>
      <h2 className="text-2xl font-semibold text-slate-800">Page Not Found</h2>
      <p className="max-w-md text-sm text-slate-600">
        Could not find requested resource or page.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
      >
        Return Home
      </Link>
    </div>
  );
}
