import type { Metadata } from "next";
import { SectionHeading } from "@/components/site/section-heading";
import { GalleryGrid, HeroLineArt, LocatorGlyph } from "@/components/gallery/gallery-grid";
import { GalleryBackground } from "@/components/gallery/gallery-background";
import { galleryEvents } from "@/data/gallery";

export const metadata: Metadata = {
  title: "Gallery — Encypherist",
  description: "Photos from Encypherist events at Jhulelal Institute of Technology, Nagpur.",
};

export default function GalleryPage() {
  return (
    <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <GalleryBackground />

      <div className="corner-brackets relative overflow-hidden pb-8">
        <HeroLineArt />

        <SectionHeading
          eyebrow="Gallery"
          title={
            <>
              Moments, logged
              <br className="hidden sm:block" /> and <span className="text-primary">captioned.</span>
            </>
          }
          description="An archive of Encypherist events, collected one story at a time."
        />
        <span className="mt-6 block h-px w-10 bg-border" />

        <p className="pointer-events-none absolute bottom-0 right-0 hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 sm:flex">
          <LocatorGlyph className="size-3 text-muted-foreground/50" />
          N 21.1458&deg; E 79.0882&deg;
        </p>
      </div>

      <div className="mt-14">
        <GalleryGrid events={galleryEvents} />
      </div>
    </div>
  );
}
