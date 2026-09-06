"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { getCollections } from "@/lib/mongodb";
import { requireAdminApi, AdminAuthError } from "@/lib/admin-guard";
import { logAdminAction } from "@/lib/audit";
import { getRegistrationById } from "@/lib/data/registrations";
import { participantInfoSchema } from "@/lib/validation/registration";
import type { ActionResult } from "./events";
import type { RegistrationStatus } from "@/types/models";

function fail(error: string): ActionResult<never> {
  return { ok: false, error };
}

const REGISTRATION_STATUSES: RegistrationStatus[] = ["pending", "approved", "rejected", "waitlisted"];

export async function updateRegistrationStatus(id: string, status: RegistrationStatus): Promise<ActionResult> {
  try {
    const admin = await requireAdminApi();
    if (!ObjectId.isValid(id)) return fail("Invalid registration.");
    if (!REGISTRATION_STATUSES.includes(status)) return fail("Invalid status.");

    const existing = await getRegistrationById(id);
    if (!existing) return fail("Registration not found.");

    const { registrations } = await getCollections();
    await registrations.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date(), updatedBy: admin.id } }
    );

    await logAdminAction(admin, "registration.status_changed", "registration", id, {
      from: existing.status,
      to: status,
    });
    revalidatePath(`/admin/events/${existing.eventId}/participants`);

    return { ok: true, data: undefined };
  } catch (err) {
    if (err instanceof AdminAuthError) return fail(err.message);
    console.error("updateRegistrationStatus failed", err);
    return fail("Something went wrong updating the status.");
  }
}

export async function updateRegistrationParticipant(
  id: string,
  patch: { individual?: unknown; teamName?: string; leader?: unknown }
): Promise<ActionResult> {
  try {
    const admin = await requireAdminApi();
    if (!ObjectId.isValid(id)) return fail("Invalid registration.");

    const existing = await getRegistrationById(id);
    if (!existing) return fail("Registration not found.");

    const { registrations } = await getCollections();
    const update: Record<string, unknown> = { updatedAt: new Date(), updatedBy: admin.id };

    if (existing.registrationType === "individual" && patch.individual) {
      const parsed = participantInfoSchema.safeParse(patch.individual);
      if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid participant data.");
      update.individual = parsed.data;
    } else if (existing.registrationType === "team") {
      if (patch.teamName) update["team.teamName"] = patch.teamName;
      if (patch.leader) {
        const parsed = participantInfoSchema.safeParse(patch.leader);
        if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid leader data.");
        update["team.leader"] = parsed.data;
      }
    }

    await registrations.updateOne({ _id: new ObjectId(id) }, { $set: update });
    await logAdminAction(admin, "registration.updated", "registration", id, {});
    revalidatePath(`/admin/events/${existing.eventId}/participants`);

    return { ok: true, data: undefined };
  } catch (err) {
    if (err instanceof AdminAuthError) return fail(err.message);
    console.error("updateRegistrationParticipant failed", err);
    return fail("Something went wrong updating the registration.");
  }
}

export async function softDeleteRegistration(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdminApi();
    if (!ObjectId.isValid(id)) return fail("Invalid registration.");

    const existing = await getRegistrationById(id);
    if (!existing) return fail("Registration not found.");

    const { registrations } = await getCollections();
    await registrations.updateOne(
      { _id: new ObjectId(id) },
      { $set: { deletedAt: new Date(), updatedAt: new Date(), updatedBy: admin.id } }
    );

    await logAdminAction(admin, "registration.deleted", "registration", id, {});
    revalidatePath(`/admin/events/${existing.eventId}/participants`);

    return { ok: true, data: undefined };
  } catch (err) {
    if (err instanceof AdminAuthError) return fail(err.message);
    console.error("softDeleteRegistration failed", err);
    return fail("Something went wrong deleting the registration.");
  }
}
