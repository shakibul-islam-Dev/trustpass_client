export { cn } from "cn"


/**
 * Validates whether a string is a valid URL.
 * Returns true only for absolute URLs (http/https).
 */
export const isValidUrl = (url?: string | null): boolean => {
  if (!url || url.trim() === "") return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};