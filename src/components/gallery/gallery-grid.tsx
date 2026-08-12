"use client";

import { useState } from "react";
import { PosterPlaceholder } from "@/components/events/event-card";
import { Lightbox } from "@/components/gallery/lightbox";
import type { GalleryEntry } from "@/lib/data/gallery";

export function GalleryGrid({ items }: { items: GalleryEntry[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group mb-4 block w-full break-inside-avoid overflow-hidden border border-border text-left transition-colors hover:border-primary/40"
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
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox
          items={items}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      )}
    </>
  );
}
