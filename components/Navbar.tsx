import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        <Link href="/" className="text-xl font-bold">
          TrustPass
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm hover:text-blue-600">
            Home
          </Link>

          <Link href="/about" className="text-sm hover:text-blue-600">
            About
          </Link>

          <Link href="/services" className="text-sm hover:text-blue-600">
            Services
          </Link>

          <Link href="/contact" className="text-sm hover:text-blue-600">
            Contact
          </Link>
        </div>

        <Link
          href="/login"
          className="rounded-md bg-black px-4 py-2 text-sm text-white"
        >
          Login
        </Link>
      </div>
    </nav>
  );
}