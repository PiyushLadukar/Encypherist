import "server-only";
import { store } from "@/lib/store";
import type { Event, EventWithDetails } from "@/types/database";

export async function getEvents(): Promise<Event[]> {
  return [...store.events].sort((a, b) => {
    const aTime = a.start_at ? new Date(a.start_at).getTime() : -Infinity;
    const bTime = b.start_at ? new Date(b.start_at).getTime() : -Infinity;
    return bTime - aTime;
  });
}

export async function getPublishedEvents(): Promise<Event[]> {
  return (await getEvents()).filter((e) => e.status === "published");
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

  upcoming.sort(
    (a, b) => new Date(a.start_at!).getTime() - new Date(b.start_at!).getTime()
  );
  past.sort((a, b) => new Date(b.start_at!).getTime() - new Date(a.start_at!).getTime());

  return { upcoming, past, announced };
}

function withDetails(event: Event): EventWithDetails {
  return {
    ...event,
    gallery: store.eventGallery
      .filter((g) => g.event_id === event.id)
      .sort((a, b) => a.sort_order - b.sort_order),
    faqs: store.eventFaqs
      .filter((f) => f.event_id === event.id)
      .sort((a, b) => a.sort_order - b.sort_order),
    speakers: store.eventSpeakers
      .filter((s) => s.event_id === event.id)
      .sort((a, b) => a.sort_order - b.sort_order),
    organizers: store.eventOrganizers
      .filter((o) => o.event_id === event.id)
      .sort((a, b) => a.sort_order - b.sort_order),
  };
}

/** Public: only returns a published event. */
export async function getEventBySlug(slug: string): Promise<EventWithDetails | null> {
  const event = store.events.find((e) => e.slug === slug && e.status === "published");
  return event ? withDetails(event) : null;
}

/** Admin-only in practice: returns an event regardless of status. */
export async function getEventById(id: string): Promise<EventWithDetails | null> {
  const event = store.events.find((e) => e.id === id);
  return event ? withDetails(event) : null;
}

export async function countRegistrations(eventId: string): Promise<number> {
  return store.eventRegistrations.filter((r) => r.event_id === eventId).length;
}
