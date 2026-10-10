"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Lightbox } from "@/components/gallery/lightbox";
import { getImageDimensions } from "@/lib/image-dimensions";
import type { GalleryEvent } from "@/data/gallery";
import Component from "@/components/ui/sticky-scroll";

const collageEase = [0.22, 1, 0.36, 1] as const;

/** The event's full photo set as a sticky-scroll layout — click any photo to open the fullscreen viewer. */
export function EventCollage({ event }: { event: GalleryEvent }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const stickyItems = event.images.map((image, index) => ({
    id: `${event.id}-photo-${index}`,
    title: `${event.title} — Photograph ${index + 1}`,
    image,
  }));

  return (
    <>
      <div className="relative">
        <Component
          items={stickyItems}
          footerTitle={event.title}
        />
      </div>

      <AnimatePresence>
        {openIndex !== null && (
          <Lightbox event={event} index={openIndex} onClose={() => setOpenIndex(null)} onNavigate={setOpenIndex} />
        )}
      </AnimatePresence>
    </>
  );
}
