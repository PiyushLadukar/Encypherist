"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { PosterPlaceholder } from "@/components/events/event-card";
import { Lightbox } from "@/components/gallery/lightbox";
import { Stagger, StaggerItem } from "@/components/site/reveal";
import type { GalleryEntry } from "@/lib/data/gallery";

export function GalleryGrid({ items }: { items: GalleryEntry[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <Stagger className="columns-2 gap-4 sm:columns-3 lg:columns-4" stagger={0.04}>
        {items.map((item, i) => (
          <StaggerItem key={item.id} className="mb-4 break-inside-avoid">
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              className="group block w-full overflow-hidden border border-border text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="relative aspect-square">
                <PosterPlaceholder title={item.caption ?? item.event_title} />
              </div>
              <div className="border-t border-border p-3">
                <p className="truncate font-mono text-[11px] text-muted-foreground group-hover:text-foreground">
                  {item.event_title}
                </p>
              </div>
            </button>
          </StaggerItem>
        ))}
      </Stagger>

      <AnimatePresence>
        {openIndex !== null && (
          <Lightbox
            items={items}
            index={openIndex}
            onClose={() => setOpenIndex(null)}
            onNavigate={setOpenIndex}
          />
        )}
      </AnimatePresence>
    </>
  );
}
