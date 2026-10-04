"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Gets the current user session on the server side.
 * Only call from Server Components / Server Actions / Route Handlers.
 */
export const getUserServerSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user || null;
};