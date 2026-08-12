import "server-only";
import { store } from "@/lib/store";
import type { EventGalleryItem } from "@/types/database";

export interface GalleryEntry extends EventGalleryItem {
  event_title: string;
  event_slug: string;
}

/** Public: only images belonging to published events. */
export async function getGallery(): Promise<GalleryEntry[]> {
  const publishedEventIds = new Set(
    store.events.filter((e) => e.status === "published").map((e) => e.id)
  );

  return store.eventGallery
    .filter((item) => publishedEventIds.has(item.event_id))
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => {
      const event = store.events.find((e) => e.id === item.event_id)!;
      return { ...item, event_title: event.title, event_slug: event.slug };
    });
}
