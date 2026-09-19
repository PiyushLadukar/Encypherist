import "server-only";
import { getCollections } from "@/lib/mongodb";
import { galleryEvents as staticGalleryEvents, type GalleryEvent } from "@/data/gallery";

/**
 * The public Gallery catalog, combining two sources.
 *
 * The original eleven albums are hard-coded in src/data/gallery.ts. Albums
 * added through the admin panel go to MongoDB instead: the admin route used to
 * append them to that same .ts file, which only ever worked under `next dev` —
 * a compiled production build never re-reads its own source, and on a
 * read-only host the write fails outright. Storing them in the database is
 * what lets a new album appear without a redeploy.
 *
 * Both sources are merged here so the existing albums keep working untouched.
 * A database album wins over a static one with the same id, which is what
 * makes an edit to a built-in album possible later.
 */

interface GalleryEventDoc {
  id: string;
  title: string;
  description?: string;
  poster: string;
  images: string[];
  academicYear?: string;
  createdAt?: Date;
}

function toGalleryEvent(doc: GalleryEventDoc): GalleryEvent {
  return {
    id: doc.id,
    title: doc.title,
    description: doc.description,
    poster: doc.poster,
    images: doc.images ?? [],
    academicYear: doc.academicYear,
  };
}

/**
 * Never throws. The Gallery is a public page and MongoDB may be unreachable
 * (or simply unconfigured on a fresh checkout); falling back to the static
 * catalog keeps the page rendering instead of erroring the whole route.
 */
async function loadFromDb(): Promise<GalleryEvent[]> {
  try {
    const { galleryEvents } = await getCollections();
    const docs = await galleryEvents.find({}).sort({ createdAt: -1 }).toArray();
    return docs.map((doc) => toGalleryEvent(doc as unknown as GalleryEventDoc));
  } catch (error) {
    console.error("Gallery: could not read gallery_events from MongoDB.", error);
    return [];
  }
}

/** Newest admin-created albums first, then the built-in catalog in its authored order. */
export async function getGalleryEvents(): Promise<GalleryEvent[]> {
  const fromDb = await loadFromDb();
  const dbIds = new Set(fromDb.map((e) => e.id));
  return [...fromDb, ...staticGalleryEvents.filter((e) => !dbIds.has(e.id))];
}

export async function getGalleryEvent(id: string): Promise<GalleryEvent | undefined> {
  const all = await getGalleryEvents();
  return all.find((event) => event.id === id);
}

/** True when the id is already taken by either source — the admin create flow rejects duplicates. */
export async function galleryEventExists(id: string): Promise<boolean> {
  return Boolean(await getGalleryEvent(id));
}

export async function insertGalleryEvent(event: GalleryEvent): Promise<void> {
  const { galleryEvents } = await getCollections();
  await galleryEvents.insertOne({ ...event, createdAt: new Date() });
}

/** Only removes the database record — the caller deletes the files. */
export async function deleteGalleryEvent(id: string): Promise<boolean> {
  const { galleryEvents } = await getCollections();
  const result = await galleryEvents.deleteOne({ id });
  return result.deletedCount > 0;
}

/** Albums baked into the build cannot be removed from the admin panel — they live in source. */
export function isStaticGalleryEvent(id: string): boolean {
  return staticGalleryEvents.some((event) => event.id === id);
}
