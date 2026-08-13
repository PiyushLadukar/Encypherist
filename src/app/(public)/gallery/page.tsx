import type { Metadata } from "next";
import { SectionHeading } from "@/components/site/section-heading";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { galleryEvents } from "@/data/gallery";

export const metadata: Metadata = {
  title: "Gallery — Encypherist",
  description: "Photos from Encypherist events at Jhulelal Institute of Technology, Nagpur.",
};

export default function GalleryPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Gallery"
        title="Moments, logged and captioned."
        description="An archive of Encypherist events, collected one story at a time."
      />

      <div className="mt-12">
        <GalleryGrid events={galleryEvents} />
      </div>
    </div>
  );
}
