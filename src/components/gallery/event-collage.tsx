"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Lightbox } from "@/components/gallery/lightbox";
import { Stagger, StaggerItem } from "@/components/site/reveal";
import { getImageDimensions } from "@/lib/image-dimensions";
import type { GalleryEvent } from "@/data/gallery";

const collageEase = [0.22, 1, 0.36, 1] as const;

/** The event's full photo set as a masonry collage — click any photo to open the fullscreen viewer. */
export function EventCollage({ event }: { event: GalleryEvent }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <Stagger className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4" stagger={0.05}>
        {event.images.map((image, index) => (
          <StaggerItem key={image} className="mb-4 block break-inside-avoid">
            <motion.button
              type="button"
              onClick={() => setOpenIndex(index)}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.3, ease: collageEase }}
              className="group relative block w-full overflow-hidden rounded-xl bg-card text-left shadow-sm transition-shadow duration-300 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label={`Open photo ${index + 1} from ${event.title}`}
            >
              <Image
                src={image}
                alt={`${event.title} photograph ${index + 1}`}
                width={getImageDimensions(image).width}
                height={getImageDimensions(image).height}
                // Masonry: one column on mobile, two from sm, three from lg,
                // four from xl inside a max-w-6xl page — roughly 260px each at
                // the widest. Without this the browser assumes 100vw and pulls
                // a needlessly large file for every thumbnail.
                sizes="(min-width: 1280px) 260px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                loading={index > 5 ? "lazy" : "eager"}
                className="block h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            </motion.button>
          </StaggerItem>
        ))}
      </Stagger>

      <AnimatePresence>
        {openIndex !== null && (
          <Lightbox event={event} index={openIndex} onClose={() => setOpenIndex(null)} onNavigate={setOpenIndex} />
        )}
      </AnimatePresence>
    </>
  );
}
