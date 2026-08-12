import type { Metadata } from "next";
import { SectionHeading } from "@/components/site/section-heading";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { getGallery } from "@/lib/data/gallery";

export const metadata: Metadata = {
  title: "Gallery — Encypherist",
  description: "Photos from Encypherist events at Jhulelal Institute of Technology, Nagpur.",
};

export const revalidate = 0;

export default async function GalleryPage() {
  const items = await getGallery().catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Gallery"
        title="Moments, logged and captioned."
        description="Photography from published events. Real event photos go here as they're added — see docs/research.md for what's verified so far."
      />

      {items.length === 0 ? (
        <p className="mt-16 text-sm text-muted-foreground">
          No gallery images yet — none have been verified or uploaded. Check back soon.
        </p>
      ) : (
        <div className="mt-12">
          <GalleryGrid items={items} />
        </div>
      )}
    </div>
  );
}
