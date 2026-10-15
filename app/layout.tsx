import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Geist_Mono, Roboto_Flex } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/navbar/Navbar";
import AppToaster from "@/components/shared/AppToaster";

// Body + headings. The "New Learning" theme uses "Google Sans Flex",
// which is self-hosted as the Roboto Flex variable font — so we load the
// same font here to match it (weight axis 100–1000, no extra axes needed).
const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  variable: "--font-roboto-flex",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://trustpass-client.vercel.app"),
  title: {
    default: "TrustPass | Trusted Business Verification Platform",
    template: "%s | TrustPass",
  },
  description:
    "Discover verified businesses and products with TrustPass, a trusted business verification platform.",
  applicationName: "TrustPass",
  openGraph: {
    type: "website",
    siteName: "TrustPass",
    title: "TrustPass | Trusted Business Verification Platform",
    description:
      "Discover verified businesses and products with TrustPass, a trusted business verification platform.",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "TrustPass | Trusted Business Verification Platform",
    description:
      "Discover verified businesses and products with TrustPass, a trusted business verification platform.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistMono.variable,
        "font-sans",
        robotoFlex.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          {/* `flex-1` keeps the footer pinned to the bottom of the viewport
              while the page streams in (and on short pages). Without it the
              loading shell rendered navbar + footer right next to each other. */}
          <div className="flex w-full flex-1 flex-col">{children}</div>
          <AppToaster />
          <Footer></Footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
