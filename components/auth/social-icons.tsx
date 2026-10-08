/**
 * Brand logos for the social sign-in buttons.
 *
 * Small inline SVGs on purpose — no icon package required, and the brand
 * marks render crisply at any size.
 */

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.24 1.06-3.7 1.06-2.86 0-5.28-1.93-6.14-4.53H2.18v2.84C4 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.86 14.1c-.22-.66-.36-1.36-.36-2.1s.14-1.44.36-2.1V7.06H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.68-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4 3.47 2.18 7.06l3.68 2.84C6.72 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="11.5" fill="#1877F2" />
      <path
        fill="#fff"
        d="M15.7 8.5h-1.9c-.4 0-.8.3-.8.9v1.5h2.6l-.3 2.6h-2.3v6.6h-2.8v-6.6H7.7V10.9h2.5V9.2c0-1.9 1.3-3.4 3.4-3.4h2.1v2.7z"
      />
    </svg>
  );
}