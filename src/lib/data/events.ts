import "server-only";
import { getCollections } from "@/lib/mongodb";
import { toEvent, toRegistration } from "@/lib/mappers";
import { eventStartsAt, eventEndsAt } from "@/lib/event-status";
import { eligibilitySummary } from "@/lib/eligibility";
import type { Event as MongoEvent, RegistrationSettings, EligibilityConfig, RegistrationForm } from "@/types/models";
import type { Event, EventWithDetails } from "@/types/database";

/**
 * Public data layer, backed by MongoDB (see src/lib/mongodb.ts). Only ever
 * returns `published` events — draft/archived events are admin-only (see
 * src/lib/data/admin-events.ts). Maps the Mongo event document onto the
 * existing `Event`/`EventWithDetails` view-model shape so the public
 * components (EventCard, EventTimeline, EventDirectory, ComingSoonEvent,
 * sitemap, about page) keep working unchanged — they never depended on the
 * old Supabase-shaped table directly, just this shape.
 */

export type PublicEventDetail = EventWithDetails & {
  registrationConfig: RegistrationSettings;
  eligibilityConfig: EligibilityConfig;
  registrationForm: RegistrationForm;
};

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

function toPublicEvent(event: MongoEvent): Event {
  const start = eventStartsAt(event);
  const end = eventEndsAt(event);
  return {
    id: event.id,
    slug: event.slug,
    title: event.name,
    type: "other",
    status: event.status,
    summary: event.description ? truncate(event.description, 220) : null,
    description: event.description,
    start_at: start ? start.toISOString() : null,
    end_at: end ? end.toISOString() : null,
    location: event.venue,
    poster_url: event.posterUrl,
    registration_enabled: event.registrationEnabled,
    registration_deadline: event.registrationDeadline,
    capacity: null,
    eligibility: eligibilitySummary(event.eligibility),
    rules: null,
    schedule: [],
    confidence: "verified",
    created_at: event.createdAt,
    updated_at: event.updatedAt,
  };
}

export async function getPublishedEvents(): Promise<Event[]> {
  const { events } = await getCollections();
  const docs = await events.find({ status: "published" }).sort({ startDate: -1 }).toArray();
  return docs.map((doc) => toPublicEvent(toEvent(doc)));
}

export function splitUpcomingPast(events: Event[]) {
  const now = Date.now();
  const upcoming: Event[] = [];
  const past: Event[] = [];
  const announced: Event[] = [];

  for (const event of events) {
    if (!event.start_at) {
      announced.push(event);
    } else if (new Date(event.start_at).getTime() >= now) {
      upcoming.push(event);
    } else {
      past.push(event);
    }
  }

  upcoming.sort((a, b) => new Date(a.start_at!).getTime() - new Date(b.start_at!).getTime());
  past.sort((a, b) => new Date(b.start_at!).getTime() - new Date(a.start_at!).getTime());

  return { upcoming, past, announced };
}

export async function getEventBySlug(slug: string): Promise<PublicEventDetail | null> {
  const { events } = await getCollections();
  const doc = await events.findOne({ slug, status: "published" });
  if (!doc) return null;

  const mongoEvent = toEvent(doc);
  return {
    ...toPublicEvent(mongoEvent),
    gallery: [],
    faqs: [],
    speakers: [],
    organizers: [],
    registrationConfig: mongoEvent.registration,
    eligibilityConfig: mongoEvent.eligibility,
    registrationForm: mongoEvent.registrationForm,
  };
}

export async function countRegistrations(eventId: string): Promise<number> {
  const { registrations } = await getCollections();
  return registrations.countDocuments({ eventId, deletedAt: null });
}

export async function findRegistration(eventId: string, email: string) {
  const { registrations } = await getCollections();
  const doc = await registrations.findOne({
    eventId,
    deletedAt: null,
    $or: [{ "individual.email": email }, { "team.leader.email": email }],
  });
  return doc ? toRegistration(doc) : null;
}
