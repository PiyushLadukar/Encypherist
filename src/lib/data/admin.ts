import "server-only";
import { store } from "@/lib/store";
import type { EventRegistration, EventGalleryItem } from "@/types/database";

export interface RegistrationWithEvent extends EventRegistration {
  event_title: string;
}

export async function getRegistrations(eventId?: string): Promise<RegistrationWithEvent[]> {
  const filtered = eventId
    ? store.eventRegistrations.filter((r) => r.event_id === eventId)
    : store.eventRegistrations;

  return [...filtered]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((r) => {
      const event = store.events.find((e) => e.id === r.event_id);
      return { ...r, event_title: event?.title ?? "Unknown event" };
    });
}

export interface GalleryItemWithEvent extends EventGalleryItem {
  event_title: string;
}

export async function getAdminGallery(): Promise<GalleryItemWithEvent[]> {
  return [...store.eventGallery]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((item) => {
      const event = store.events.find((e) => e.id === item.event_id);
      return { ...item, event_title: event?.title ?? "Unknown event" };
    });
}

export async function getDashboardStats() {
  return {
    memberCount: store.members.length,
    eventCount: store.events.length,
    publishedEventCount: store.events.filter((e) => e.status === "published").length,
    projectCount: store.projects.length,
    registrationCount: store.eventRegistrations.length,
  };
}
