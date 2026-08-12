import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/fake-auth";

/**
 * Redirects signed-out visitors away from protected /admin/* routes. This
 * is a UX convenience only — the real security boundary is requireAdmin()
 * (src/lib/auth.ts), which every admin page/API route calls independently.
 */
export function proxy(request: NextRequest) {
  const isAdminRoute =
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login");

  const hasSession = Boolean(request.cookies.get(ADMIN_COOKIE_NAME)?.value);

  if (isAdminRoute && !hasSession) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
