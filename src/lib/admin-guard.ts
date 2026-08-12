import "server-only";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

/**
 * Every /api/admin/* route calls this first. Returns the admin user on
 * success, or a ready-to-return 401 response on failure — the caller does
 * `const guard = await requireAdminApi(); if (guard instanceof NextResponse) return guard;`
 */
export async function requireAdminApi() {
  const { user, isAdmin } = await requireAdmin();
  if (!user || !isAdmin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return { user };
}
