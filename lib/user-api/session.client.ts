"use client";

import { authClient } from "@/lib/auth-client";

/**
 * React Hook — Client Component এ call করবি।
 *
 * @example
 * ```tsx
 * const { user, isPending } = useUserSession();
 * ```
 */
export const getUserClientSession = () => {
  const { data: session, isPending, error, refetch } = authClient.useSession();
  return {
    user: session?.user || null,
    isPending,
    error,
    refetch,
  };
};