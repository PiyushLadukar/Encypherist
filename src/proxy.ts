import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * UX convenience only — redirects a logged-out browser away from /admin
 * before it renders. This is NOT the security boundary: every admin page and
 * server action independently calls requireAdmin() (see lib/admin-guard.ts),
 * which is what actually enforces access.
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
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  if (pathname.startsWith("/admin") && !isLoginPage && !req.auth) {
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
