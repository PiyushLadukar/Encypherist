import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * UX convenience only — redirects a logged-out browser away from /admin
 * before it renders. This is NOT the security boundary: every admin page and
 * server action independently calls requireAdmin() (see lib/admin-guard.ts),
 * which is what actually enforces access.
 *
 * /admin/register is public for the same reason /admin/login is — a signup
 * lands inactive and grants no access until a super admin approves it.
 *
 * Deliberately does NOT redirect an already-authenticated session away from
 * /admin/login: the JWT alone can't tell us isActive/role without a MongoDB
 * read, and requireAdminPage() sends deactivated/wrong-role admins back to
 * /admin/login on every admin page — bouncing them straight back to /admin
 * here would create an infinite redirect loop for exactly the accounts this
 * system needs to lock out. Worst case a still-valid session sees the login
 * form again, which is harmless.
 *
 * Named `proxy` (not `middleware`) per Next.js 16's renamed file convention —
 * see node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
 */
/** Reachable while logged out — the sign-in form and public self-signup. */
const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/register"]);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_ADMIN_PATHS.has(pathname);

  if (pathname.startsWith("/admin") && !isPublic && !req.auth) {
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
