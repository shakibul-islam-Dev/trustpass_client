import type { Metadata } from "next";

const siteName = "TrustPass";

export function createPageMetadata(
  title: string,
  description: string,
): Metadata {
  const brandedTitle = `${title} | ${siteName}`;

  return {
    title: {
      absolute: brandedTitle,
    },
    description,
    openGraph: {
      title: brandedTitle,
      description,
      siteName,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: brandedTitle,
      description,
    },
  };
}
