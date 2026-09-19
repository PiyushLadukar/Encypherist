import { getGalleryEvents, isStaticGalleryEvent } from "@/lib/data/gallery-events";
import { GalleryManager } from "@/components/admin/gallery-manager";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const events = await getGalleryEvents();

  // `isStaticGalleryEvent` reads the build's own catalog, so it is resolved
  // here on the server rather than shipping that catalog to the browser.
  const albums = events.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    poster: event.poster,
    photoCount: event.images.length,
    academicYear: event.academicYear,
    isBuiltIn: isStaticGalleryEvent(event.id),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Gallery</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create photo albums for past events. Photographs upload straight from here — no code changes needed.
        </p>
      </div>

      <GalleryManager albums={albums} />
    </div>
  );
}
