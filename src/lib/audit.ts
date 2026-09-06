import "server-only";
import { getCollections } from "@/lib/mongodb";
import type { Admin } from "@/types/models";

export async function logAdminAction(
  admin: Admin,
  action: string,
  targetType: string,
  targetId: string,
  meta: Record<string, unknown> = {}
) {
  const { auditLog } = await getCollections();
  await auditLog.insertOne({
    adminId: admin.id,
    adminName: admin.name,
    action,
    targetType,
    targetId,
    meta,
    createdAt: new Date(),
  });
}
