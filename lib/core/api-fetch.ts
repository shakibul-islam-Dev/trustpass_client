/**
 * Thin wrapper around `fetch` for API calls.
 *
 * Kept so every call site imports one helper instead of `fetch` directly. The
 * API origin is resolved once in `lib/core/env.ts` and baked into the URL by
 * `apiUrl()`, so there is no fallback or rewrite to do here.
 */
export async function apiFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(input, init);
}
