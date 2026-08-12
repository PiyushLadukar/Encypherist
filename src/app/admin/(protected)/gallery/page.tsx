import { GalleryManager } from "@/components/admin/gallery-manager";
import { getAdminGallery } from "@/lib/data/admin";
import { getEvents } from "@/lib/data/events";

export default async function AdminGalleryPage() {
  const [items, events] = await Promise.all([getAdminGallery(), getEvents()]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Gallery</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload photos against an event. They appear publicly once the event is published.
      </p>
      <div className="mt-6">
        <GalleryManager events={events} items={items} />
      </div>
    </div>
  );
}
