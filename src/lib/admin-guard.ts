import "server-only";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCollections } from "@/lib/mongodb";
import { toAdmin } from "@/lib/mappers";
import type { Admin, AdminRole } from "@/types/models";

export class AdminAuthError extends Error {
  status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.status = status;
  }
}

type AuthResult =
  | { kind: "unauthenticated" }
  | { kind: "denied" } // authenticated but inactive or wrong role
  | { kind: "ok"; admin: Admin };

/**
 * The real authorization boundary (spec §15's flowchart: authenticated? →
 * active admin? → has required role? → allow). Called at the top of every
 * admin Server Component, Server Action and API route — never trust the
 * `/admin/*` middleware redirect alone, and never trust the JWT's role claim
 * alone: an admin deactivated mid-session must lose access immediately, so
 * this re-reads isActive/role from MongoDB on every call.
 */
async function loadAuthResult(requiredRole?: AdminRole): Promise<AuthResult> {
  const session = await auth();
  if (!session?.user?.id) return { kind: "unauthenticated" };

  const { admins } = await getCollections();
  const doc = await admins.findOne({ _id: new ObjectId(session.user.id) });
  if (!doc || !doc.isActive) return { kind: "denied" };
  if (requiredRole && doc.role !== requiredRole) return { kind: "denied" };

  return { kind: "ok", admin: toAdmin(doc) };
}

/**
 * Use from Server Components/pages. Unauthenticated visitors go to
 * /admin/login; an authenticated-but-denied admin (deactivated, or missing
 * the required role) goes to /admin instead — sending them back to the login
 * page here would bounce forever, since their session cookie is still valid
 * and nothing forces them to actually sign out.
 */
export async function requireAdminPage(requiredRole?: AdminRole): Promise<Admin> {
  const result = await loadAuthResult(requiredRole);
  if (result.kind === "unauthenticated") redirect("/admin/login");
  if (result.kind === "denied") redirect(requiredRole ? "/admin" : "/admin/login");
  return result.admin;
}

/** Use from Server Actions/route handlers. Throws AdminAuthError — catch it and return a 401/403. */
export async function requireAdminApi(requiredRole?: AdminRole): Promise<Admin> {
  const result = await loadAuthResult(requiredRole);
  if (result.kind === "unauthenticated") throw new AdminAuthError("Not authorized.", 401);
  if (result.kind === "denied") {
    throw new AdminAuthError(requiredRole ? `This action requires the ${requiredRole} role.` : "Not authorized.", 403);
  }
  return result.admin;
}
