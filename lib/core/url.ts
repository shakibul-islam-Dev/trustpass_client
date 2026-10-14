/**
 * Small URL helpers shared by the business profile forms.
 *
 * The server's zod schemas validate website/Instagram/TikTok fields as URLs, so
 * the client checks the same thing before submitting to avoid a round trip.
 */

/** True when `value` parses as an absolute http(s) URL. */
export function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validates the three supported social/profile links.
 *
 * Empty values are allowed (a blank field clears the link). Returns a
 * user-facing message for the first invalid link, or `null` when all are fine.
 */
export function validateSocialLinks(links: { label: string; value: string }[]): string | null {
  for (const { label, value } of links) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    if (!isHttpUrl(trimmed)) {
      return `${label} must be a full URL starting with http:// or https://.`;
    }
  }
  return null;
}
