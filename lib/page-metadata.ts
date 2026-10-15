import type { Metadata } from "next";

const siteName = "TrustPass";

export function createPageMetadata(
  title: string,
  description: string,
  canonicalPath?: string,
): Metadata {
  const brandedTitle = `${title} | ${siteName}`;

  return {
    title: {
      absolute: brandedTitle,
    },
    description,
    ...(canonicalPath
      ? { alternates: { canonical: canonicalPath } }
      : {}),
    openGraph: {
      title: brandedTitle,
      description,
      siteName,
      type: "website",
      ...(canonicalPath ? { url: canonicalPath } : {}),
    },
    twitter: {
      card: "summary",
      title: brandedTitle,
      description,
    },
  };
}
