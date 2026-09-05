"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { getCollections } from "@/lib/mongodb";
import { requireAdminApi, AdminAuthError } from "@/lib/admin-guard";
import { logAdminAction } from "@/lib/audit";
import { eventSchema, type EventInput } from "@/lib/validation/event";
import { getEventById, getEventBySlugAdmin } from "@/lib/data/admin-events";
import { saveUploadedImage, deleteUploadedFile, UploadError } from "@/lib/uploads";

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

function fail(error: string): ActionResult<never> {
  return { ok: false, error };
}

export async function createEvent(input: EventInput): Promise<ActionResult<{ id: string }>> {
  try {
    const admin = await requireAdminApi();
    const parsed = eventSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid event data.");

    const existing = await getEventBySlugAdmin(parsed.data.slug);
    if (existing) return fail("An event with this URL slug already exists.");

    const { events } = await getCollections();
    const now = new Date();
    const doc = toDoc(parsed.data, admin.id, now, now);
    const result = await events.insertOne(doc);

    await logAdminAction(admin, "event.created", "event", result.insertedId.toHexString(), { name: parsed.data.name });
    revalidatePath("/admin/events");
    revalidatePath("/events");

    return { ok: true, data: { id: result.insertedId.toHexString() } };
  } catch (err) {
    if (err instanceof AdminAuthError) return fail(err.message);
    console.error("createEvent failed", err);
    return fail("Something went wrong creating the event.");
  }
}

export async function updateEvent(id: string, input: EventInput): Promise<ActionResult> {
  try {
    const admin = await requireAdminApi();
    if (!ObjectId.isValid(id)) return fail("Invalid event.");

    const parsed = eventSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid event data.");

    const existing = await getEventById(id);
    if (!existing) return fail("Event not found.");

    const duplicateSlug = await getEventBySlugAdmin(parsed.data.slug, id);
    if (duplicateSlug) return fail("An event with this URL slug already exists.");

    const { events } = await getCollections();
    const now = new Date();
    const fieldsChanged =
      JSON.stringify(existing.registrationForm.fields) !== JSON.stringify(parsed.data.registrationForm.fields);
    const version = fieldsChanged ? existing.registrationForm.version + 1 : existing.registrationForm.version;

    const doc = toDoc(parsed.data, existing.createdBy, new Date(existing.createdAt), now, version);
    await events.updateOne({ _id: new ObjectId(id) }, { $set: doc });

    await logAdminAction(admin, "event.updated", "event", id, { name: parsed.data.name, formVersionBumped: fieldsChanged });
    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${id}/edit`);
    revalidatePath("/events");
    revalidatePath(`/events/${parsed.data.slug}`);

    return { ok: true, data: undefined };
  } catch (err) {
    if (err instanceof AdminAuthError) return fail(err.message);
    console.error("updateEvent failed", err);
    return fail("Something went wrong updating the event.");
  }
}

export async function setEventStatus(
  id: string,
  status: "draft" | "published" | "archived"
): Promise<ActionResult> {
  try {
    const admin = await requireAdminApi();
    if (!ObjectId.isValid(id)) return fail("Invalid event.");

    const existing = await getEventById(id);
    if (!existing) return fail("Event not found.");

    if (status === "published") {
      if (!existing.startDate) return fail("Set a start date before publishing.");
      if (!existing.name || existing.name.trim().length < 2) return fail("Set an event name before publishing.");
      if (existing.registration.type !== "individual" && !existing.registration.teamSize) {
        return fail("Configure a team size before publishing a team event.");
      }
    }

    const { events } = await getCollections();
    await events.updateOne({ _id: new ObjectId(id) }, { $set: { status, updatedAt: new Date() } });

    await logAdminAction(admin, `event.${status}`, "event", id, {});
    revalidatePath("/admin/events");
    revalidatePath("/events");
    revalidatePath(`/events/${existing.slug}`);

    return { ok: true, data: undefined };
  } catch (err) {
    if (err instanceof AdminAuthError) return fail(err.message);
    console.error("setEventStatus failed", err);
    return fail("Something went wrong updating the event status.");
  }
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdminApi();
    if (!ObjectId.isValid(id)) return fail("Invalid event.");

    const existing = await getEventById(id);
    if (!existing) return fail("Event not found.");

    const { events, registrations } = await getCollections();
    const registrationCount = await registrations.countDocuments({ eventId: id });
    if (registrationCount > 0) {
      return fail("This event has registrations — archive it instead of deleting.");
    }

    await deleteUploadedFile(existing.posterUrl);
    await events.deleteOne({ _id: new ObjectId(id) });

    await logAdminAction(admin, "event.deleted", "event", id, { name: existing.name });
    revalidatePath("/admin/events");
    revalidatePath("/events");

    return { ok: true, data: undefined };
  } catch (err) {
    if (err instanceof AdminAuthError) return fail(err.message);
    console.error("deleteEvent failed", err);
    return fail("Something went wrong deleting the event.");
  }
}

export async function uploadEventPoster(eventId: string, formData: FormData): Promise<ActionResult<{ posterUrl: string }>> {
  try {
    const admin = await requireAdminApi();
    if (!ObjectId.isValid(eventId)) return fail("Invalid event.");

    const existing = await getEventById(eventId);
    if (!existing) return fail("Event not found.");

    const file = formData.get("poster");
    if (!(file instanceof File)) return fail("No file was uploaded.");

    const posterUrl = await saveUploadedImage(file, `event-posters/${eventId}`);
    await deleteUploadedFile(existing.posterUrl);

    const { events } = await getCollections();
    await events.updateOne({ _id: new ObjectId(eventId) }, { $set: { posterUrl, updatedAt: new Date() } });

    await logAdminAction(admin, "event.poster_uploaded", "event", eventId, {});
    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${eventId}/edit`);
    revalidatePath(`/events/${existing.slug}`);

    return { ok: true, data: { posterUrl } };
  } catch (err) {
    if (err instanceof AdminAuthError) return fail(err.message);
    if (err instanceof UploadError) return fail(err.message);
    console.error("uploadEventPoster failed", err);
    return fail("Something went wrong uploading the poster.");
  }
}

function toDoc(input: EventInput, createdBy: string | null, createdAt: Date, updatedAt: Date, formVersion?: number) {
  return {
    slug: input.slug,
    name: input.name,
    description: input.description || null,
    startDate: input.startDate ? new Date(input.startDate) : null,
    startTime: input.startTime || null,
    endDate: input.endDate ? new Date(input.endDate) : null,
    endTime: input.endTime || null,
    venue: input.venue || null,
    registrationDeadline: input.registrationDeadline ? new Date(input.registrationDeadline) : null,
    coordinator: {
      name: input.coordinator.name || "",
      email: input.coordinator.email || "",
      phone: input.coordinator.phone || "",
    },
    status: input.status,
    registrationEnabled: input.registrationEnabled,
    eligibility: input.eligibility,
    registration: input.registration,
    registrationForm: { version: formVersion ?? 1, fields: input.registrationForm.fields },
    createdBy,
    createdAt,
    updatedAt,
  };
}
