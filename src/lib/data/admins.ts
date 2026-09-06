import "server-only";
import { getCollections } from "@/lib/mongodb";
import { toAdmin } from "@/lib/mappers";
import type { Admin } from "@/types/models";

export async function listAdmins(): Promise<Admin[]> {
  const { admins } = await getCollections();
  const docs = await admins.find({}).sort({ createdAt: 1 }).toArray();
  return docs.map(toAdmin);
}

export async function findAdminByEmail(email: string) {
  const { admins } = await getCollections();
  const doc = await admins.findOne({ email: email.toLowerCase() });
  return doc ? toAdmin(doc) : null;
}
