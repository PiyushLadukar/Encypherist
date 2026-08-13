"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ArrowLeft, ArrowUpRight, Images } from "lucide-react";
import { Lightbox } from "@/components/gallery/lightbox";
import type { GalleryEvent } from "@/data/gallery";

const galleryEase = [0.22, 1, 0.36, 1] as const;
const dicePositions = [
  "col-span-1 lg:col-start-1 lg:row-start-1 lg:pt-2",
  "col-span-1 lg:col-start-3 lg:row-start-1 lg:-mt-6",
  "col-span-1 sm:col-span-2 lg:col-span-1 lg:col-start-2 lg:row-start-2 lg:scale-[1.045] lg:py-3",
  "col-span-1 lg:col-start-1 lg:row-start-3 lg:mt-5",
  "col-span-1 lg:col-start-3 lg:row-start-3 lg:-mt-3",
];
const firstCompositionPositions = [0, 1, 2, 4, 3];

export function GalleryGrid({ events }: { events: GalleryEvent[] }) {
  const [selectedEvent, setSelectedEvent] = useState<GalleryEvent | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (events.length === 0) {
    return (
      <div className="border border-dashed border-border px-6 py-14 text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Archive pending</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          Event posters and photographs will appear here as they are added to the local Gallery catalog.
        </p>
      </div>
    );
  }

  return (
    <>
      <LayoutGroup>
        <AnimatePresence initial={false} mode="popLayout">
        {selectedEvent ? (
          <motion.section
            key={selectedEvent.id}
            initial={{ opacity: 0, y: 14, scale: 0.992 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.992 }}
            transition={{ duration: 0.46, ease: galleryEase }}
          >
            <div className="mb-8 grid gap-6 border-b border-border pb-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(15rem,0.65fr)] lg:items-end">
              <motion.div
                layoutId={`poster-${selectedEvent.id}`}
                transition={{ duration: 0.52, ease: galleryEase }}
                className="order-last flex aspect-video items-center justify-center overflow-hidden bg-muted lg:order-first"
              >
                <img
                  src={selectedEvent.poster}
                  alt={`${selectedEvent.title} event poster`}
                  className="block max-h-[44vh] max-w-full object-contain"
                />
              </motion.div>
              <div className="flex flex-col justify-end lg:pb-2">
                <motion.button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.08, ease: galleryEase }}
                  className="mb-5 inline-flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  <ArrowLeft className="size-3.5" />
                  Back to Gallery
                </motion.button>
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1, ease: galleryEase }}
                  className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                >
                  Event archive • {String(events.findIndex((e) => e.id === selectedEvent.id) + 1).padStart(2, "0")} / {String(events.length).padStart(2, "0")}
                </motion.p>
                <motion.h2 layoutId={`title-${selectedEvent.id}`} className="mt-2 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  {selectedEvent.title}
                </motion.h2>
                {selectedEvent.description && (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.34, delay: 0.12, ease: galleryEase }}
                    className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground"
                  >
                    {selectedEvent.description}
                  </motion.p>
                )}
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.34, delay: 0.14, ease: galleryEase }}
                  className="mt-5 font-mono text-xs text-muted-foreground"
                >
                  {selectedEvent.images.length} {selectedEvent.images.length === 1 ? "photograph" : "photographs"}
                </motion.p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.08, ease: galleryEase }}
              className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4"
            >
              {selectedEvent.images.map((image, index) => (
                <motion.button
                  key={image}
                  type="button"
                  initial={{ opacity: 0, y: 10, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.36, delay: 0.12 + Math.min(index * 0.04, 0.28), ease: galleryEase }}
                  onClick={() => setOpenIndex(index)}
                  className="group relative mb-4 block w-full break-inside-avoid overflow-hidden bg-card text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  aria-label={`Open photo ${index + 1} from ${selectedEvent.title}`}
                >
                  <img
                    src={image}
                    alt={`${selectedEvent.title} photograph ${index + 1}`}
                    className="block h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.025]"
                    loading={index > 5 ? "lazy" : "eager"}
                  />
                </motion.button>
              ))}
            </motion.div>
          </motion.section>
        ) : (
          <motion.div
            key="gallery-events"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: galleryEase }}
            className="mx-auto max-w-5xl"
          >
            {[events.slice(0, 5), events.slice(5, 10)].map((group, groupIndex) => (
              <motion.section
                key={`archive-group-${groupIndex + 1}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: groupIndex === 0 ? 0.06 : 0, ease: galleryEase }}
                className={groupIndex === 0 ? "" : "mt-24 pt-10 sm:mt-32"}
              >
                {groupIndex === 1 && (
                  <div className="mb-16 sm:mb-24 flex items-center justify-center gap-4 text-center">
                    <div className="h-px flex-1 bg-border/40" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/70">
                      Archive Collection • Part II
                    </span>
                    <div className="h-px flex-1 bg-border/40" />
                  </div>
                )}
                <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-14 lg:grid-cols-3 lg:grid-rows-3 lg:gap-x-16 lg:gap-y-16">
                  {group.map((event, positionIndex) => {
                    const eventIndex = groupIndex * 5 + positionIndex;
                    const dicePosition = groupIndex === 0 ? firstCompositionPositions[positionIndex] : positionIndex;

                    return (
                      <motion.button
                        key={event.id}
                        type="button"
                        initial={{ opacity: 0, y: 16, scale: 0.98 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, amount: 0.15 }}
                        exit={{ opacity: 0, y: -8, scale: 0.985 }}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.985 }}
                        transition={{ duration: 0.46, delay: Math.min(positionIndex * 0.07, 0.28), ease: galleryEase }}
                        onClick={() => setSelectedEvent(event)}
                        className={`group w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${dicePositions[dicePosition]}`}
                        aria-label={`Open ${event.title} photo gallery`}
                      >
                        <motion.div
                          layoutId={`poster-${event.id}`}
                          transition={{ duration: 0.52, ease: galleryEase }}
                          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-muted/80 p-2 shadow-sm border border-border/40 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:border-border/80 group-hover:shadow-xl"
                        >
                          <img
                            src={event.poster}
                            alt={`${event.title} event poster`}
                            className="max-h-full max-w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.018]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />
                          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-background/90 px-2.5 py-1 font-mono text-[10px] text-foreground backdrop-blur-md border border-border/40 transition-transform duration-300 group-hover:-translate-y-0.5">
                            <Images className="size-3 text-muted-foreground" /> {event.images.length}
                          </span>
                        </motion.div>
                        <div className="mt-3.5 flex items-start justify-between gap-3 border-l-2 border-border/50 pl-3.5 pt-0.5 transition-colors duration-300 group-hover:border-primary/70">
                          <div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">
                              ARCHIVE {String(eventIndex + 1).padStart(2, "0")} / {String(events.length).padStart(2, "0")}
                            </p>
                            <motion.h2 layoutId={`title-${event.id}`} className="mt-1 font-heading text-xl sm:text-2xl font-semibold tracking-tight text-foreground transition-transform duration-300 group-hover:translate-x-0.5">{event.title}</motion.h2>
                            {event.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{event.description}</p>}
                          </div>
                          <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground/70 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.section>
            ))}
          </motion.div>
        )}
        </AnimatePresence>
      </LayoutGroup>

      {selectedEvent && openIndex !== null && (
        <Lightbox
          event={selectedEvent}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      )}
    </>
  );
}
