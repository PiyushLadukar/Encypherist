import "server-only";
import { ObjectId, type Filter, type Document } from "mongodb";
import { getCollections } from "@/lib/mongodb";
import { toEvent, toRegistration } from "@/lib/mappers";
import { deriveEventStatus } from "@/lib/event-status";
import { escapeRegex } from "@/lib/mongo-regex";
import type { Event, EventDisplayStatus } from "@/types/models";

/** Admin-only queries — every caller must already be behind requireAdminPage/Api(). */

export type EventListFilter = {
  search?: string;
  status?: EventDisplayStatus | "all";
  page?: number;
  pageSize?: number;
};

export async function listEvents({ search, status = "all", page = 1, pageSize = 20 }: EventListFilter = {}) {
  const { events } = await getCollections();
  const filter: Filter<Document> = {};
  if (search) {
    const rx = { $regex: escapeRegex(search), $options: "i" };
    filter.$or = [{ name: rx }, { slug: rx }];
  }

  const docs = await events.find(filter).sort({ createdAt: -1 }).toArray();
  let mapped = docs.map(toEvent);

  if (status !== "all") {
    mapped = mapped.filter((e) => deriveEventStatus(e) === status);
  }

  const total = mapped.length;
  const start = (page - 1) * pageSize;
  const pageItems = mapped.slice(start, start + pageSize);

  return { events: pageItems, total };
}

export async function getEventById(id: string): Promise<Event | null> {
  if (!ObjectId.isValid(id)) return null;
  const { events } = await getCollections();
  const doc = await events.findOne({ _id: new ObjectId(id) });
  return doc ? toEvent(doc) : null;
}

export async function getEventBySlugAdmin(slug: string, excludeId?: string): Promise<Event | null> {
  const { events } = await getCollections();
  const filter: Filter<Document> = { slug };
  if (excludeId && ObjectId.isValid(excludeId)) filter._id = { $ne: new ObjectId(excludeId) };
  const doc = await events.findOne(filter);
  return doc ? toEvent(doc) : null;
}

export async function getDashboardStats() {
  const { events, registrations } = await getCollections();
  const allEventDocs = await events.find({}).toArray();
  const allEvents = allEventDocs.map(toEvent);

  const counts = { total: allEvents.length, upcoming: 0, ongoing: 0, completed: 0, draft: 0, archived: 0 };
  for (const event of allEvents) {
    const status = deriveEventStatus(event);
    if (status === "draft") counts.draft++;
    else if (status === "archived") counts.archived++;
    else if (status === "ongoing") counts.ongoing++;
    else if (status === "completed") counts.completed++;
    else counts.upcoming++; // upcoming / registration_open / registration_closed
  }

  const totalRegistrations = await registrations.countDocuments({ deletedAt: null });

  return { ...counts, totalRegistrations };
}

export async function getRegistrationsPerEvent(limit = 10) {
  const { events, registrations } = await getCollections();
  const docs = await events.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
  const result = [];
  for (const doc of docs) {
    const event = toEvent(doc);
    const count = await registrations.countDocuments({ eventId: event.id, deletedAt: null });
    result.push({ event, count });
  }
  return result;
}

export async function getUpcomingEvents(limit = 5): Promise<Event[]> {
  const { events } = await getCollections();
  const docs = await events
    .find({ status: "published", startDate: { $gte: new Date() } })
    .sort({ startDate: 1 })
    .limit(limit)
    .toArray();
  return docs.map(toEvent);
}

export async function getRecentlyCreatedEvents(limit = 5): Promise<Event[]> {
  const { events } = await getCollections();
  const docs = await events.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
  return docs.map(toEvent);
}

export async function getRecentRegistrations(limit = 8) {
  const { registrations, events } = await getCollections();
  const docs = await registrations.find({ deletedAt: null }).sort({ submittedAt: -1 }).limit(limit).toArray();
  const eventIds = Array.from(new Set(docs.map((d) => String(d.eventId))));
  const eventDocs = await events
    .find({ _id: { $in: eventIds.filter(ObjectId.isValid).map((id) => new ObjectId(id)) } })
    .toArray();
  const eventNameById = new Map(eventDocs.map((e) => [e._id.toHexString(), e.name as string]));

  return docs.map((doc) => {
    const registration = toRegistration(doc);
    return { registration, eventName: eventNameById.get(registration.eventId) ?? "Unknown event" };
  });
}
