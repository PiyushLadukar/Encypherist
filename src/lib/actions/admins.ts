"use server";

import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getCollections } from "@/lib/mongodb";
import { requireAdminApi, AdminAuthError } from "@/lib/admin-guard";
import { logAdminAction } from "@/lib/audit";
import { createAdminSchema, type CreateAdminInput } from "@/lib/validation/admin";
import { findAdminByEmail } from "@/lib/data/admins";
import type { ActionResult } from "./events";

function fail(error: string): ActionResult<never> {
  return { ok: false, error };
}

export async function createAdminAccount(input: CreateAdminInput): Promise<ActionResult<{ id: string }>> {
  try {
    const admin = await requireAdminApi("super_admin");
    const parsed = createAdminSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid admin data.");

    const existing = await findAdminByEmail(parsed.data.email);
    if (existing) return fail("An admin with this email already exists.");

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const { admins } = await getCollections();
    const now = new Date();
    const result = await admins.insertOne({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
    });

    await logAdminAction(admin, "admin.created", "admin", result.insertedId.toHexString(), {
      email: parsed.data.email,
      role: parsed.data.role,
    });
    revalidatePath("/admin/admins");

    return { ok: true, data: { id: result.insertedId.toHexString() } };
  } catch (err) {
    if (err instanceof AdminAuthError) return fail(err.message);
    console.error("createAdminAccount failed", err);
    return fail("Something went wrong creating the admin.");
  }
}

export async function setAdminActive(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    const admin = await requireAdminApi("super_admin");
    if (!ObjectId.isValid(id)) return fail("Invalid admin.");
    if (id === admin.id && !isActive) return fail("You can't deactivate your own account.");

    const { admins } = await getCollections();

    if (!isActive) {
      const target = await admins.findOne({ _id: new ObjectId(id) });
      if (target?.role === "super_admin") {
        const activeSuperAdmins = await admins.countDocuments({ role: "super_admin", isActive: true });
        if (activeSuperAdmins <= 1) return fail("At least one active super admin must remain.");
      }
    }

    await admins.updateOne({ _id: new ObjectId(id) }, { $set: { isActive, updatedAt: new Date() } });

    await logAdminAction(admin, isActive ? "admin.activated" : "admin.deactivated", "admin", id, {});
    revalidatePath("/admin/admins");

    return { ok: true, data: undefined };
  } catch (err) {
    if (err instanceof AdminAuthError) return fail(err.message);
    console.error("setAdminActive failed", err);
    return fail("Something went wrong updating the admin.");
  }
}
