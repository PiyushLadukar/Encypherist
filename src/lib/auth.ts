import "server-only";
import { cookies } from "next/headers";
import { getSessionEmail, ADMIN_COOKIE_NAME } from "@/lib/fake-auth";

/**
 * Resolves the current request's admin session. Every admin page/API route
 * must call this — the proxy (middleware) redirect on /admin/* is a UX
 * convenience, not the security boundary; this function is.
 */
export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const email = getSessionEmail(token);

  if (!email) {
    return { user: null, isAdmin: false as const };
  }

  return { user: { email }, isAdmin: true as const, role: "admin" as const };
}
