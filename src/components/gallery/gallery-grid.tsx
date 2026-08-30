"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ArrowLeft, ArrowUpRight, Images } from "lucide-react";
import { Lightbox } from "@/components/gallery/lightbox";
import { DEFAULT_ACADEMIC_YEARS, type GalleryEvent } from "@/data/gallery";

const galleryEase = [0.22, 1, 0.36, 1] as const;

function formatYearLabel(year: string) {
  return year.replace(/[-–—]/g, " — ");
}

export function GalleryGrid({ events: initialEvents }: { events: GalleryEvent[] }) {
  const [events, setEvents] = useState<GalleryEvent[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<GalleryEvent | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Group academic years (newest first, starting with 2026–27)
  const academicYears = useMemo(() => {
    const yearsSet = new Set<string>(DEFAULT_ACADEMIC_YEARS);
    events.forEach((e) => {
      if (e.academicYear) yearsSet.add(e.academicYear);
    });
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [events]);

  // Set 2026–27 expanded initially
  const [openYears, setOpenYears] = useState<Set<string>>(
    () => new Set(["2026–27"])
  );

  const toggleYear = (year: string) => {
    setOpenYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  };

  if (events.length === 0 && academicYears.length === 0) {
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
            {/* Event Detail Hero Layout: 60-65% Hero Image space on desktop */}
            <div className="mb-10 grid gap-8 border-b border-border/80 pb-10 lg:grid-cols-[minmax(0,1.65fr)_minmax(14rem,1fr)] lg:items-center">
              <motion.div
                layoutId={`poster-${selectedEvent.id}`}
                transition={{ duration: 0.52, ease: galleryEase }}
                className="order-last flex aspect-video sm:aspect-[16/10] max-h-[68vh] w-full items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-muted/80 shadow-lg lg:order-first"
              >
                <img
                  src={selectedEvent.poster}
                  alt={`${selectedEvent.title} event poster`}
                  className="block max-h-full max-w-full object-contain"
                />
              </motion.div>
              <div className="flex flex-col justify-center lg:pl-2">
                <motion.button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.08, ease: galleryEase }}
                  className="mb-6 inline-flex items-center gap-2.5 font-mono text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  <ArrowLeft className="size-4" />
                  Back to Gallery
                </motion.button>
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1, ease: galleryEase }}
                  className="font-mono text-xs font-semibold uppercase tracking-widest text-primary"
                >
                  EVENT ARCHIVE • {selectedEvent.academicYear || "2025–26"}
                </motion.p>
                <motion.h2 layoutId={`title-${selectedEvent.id}`} className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {selectedEvent.title}
                </motion.h2>
                {selectedEvent.description && (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.34, delay: 0.12, ease: galleryEase }}
                    className="mt-3.5 max-w-2xl text-sm sm:text-base leading-relaxed text-muted-foreground"
                  >
                    {selectedEvent.description}
                  </motion.p>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.34, delay: 0.14, ease: galleryEase }}
                  className="mt-6 flex items-center gap-3"
                >
                  <span className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground/90 bg-muted/60 px-3 py-1.5 rounded-md border border-border/50">
                    <Images className="size-4 text-muted-foreground" />
                    {selectedEvent.images.length} {selectedEvent.images.length === 1 ? "photograph" : "photographs"}
                  </span>
                </motion.div>
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
                  className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl bg-card text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
            key="gallery-years-list"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: galleryEase }}
            className="mx-auto max-w-5xl space-y-6 sm:space-y-8"
          >
            {academicYears.map((year) => {
              const yearEvents = events.filter(
                (e) => (e.academicYear || "2025–26") === year
              );
              const isOpen = openYears.has(year);
              const countText = `${String(yearEvents.length).padStart(2, "0")} ${
                yearEvents.length === 1 ? "EVENT" : "EVENTS"
              }`;

              return (
                <section key={year} className="w-full">
                  <button
                    type="button"
                    onClick={() => toggleYear(year)}
                    className="group flex w-full items-center justify-between py-3 sm:py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3">
                      <h2 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                        {formatYearLabel(year)}
                      </h2>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6">
                      <span className="font-mono text-xs sm:text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground group-hover:text-foreground transition-colors">
                        {countText}
                      </span>
                      <span className="flex size-7 items-center justify-center font-mono text-lg font-normal text-muted-foreground transition-colors group-hover:text-primary">
                        {isOpen ? "−" : "+"}
                      </span>
                    </div>
                  </button>
                  <div className="h-px w-full bg-border/60 mb-4 sm:mb-6" />

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.36, ease: galleryEase }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4 sm:space-y-5 pb-2">
                          {yearEvents.length === 0 ? (
                            <div className="border border-dashed border-border/50 px-6 py-10 text-center bg-card/30 rounded-xl">
                              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Archive pending</p>
                              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-muted-foreground/80">
                                Event photographs for {year} will appear here as they are added to the gallery.
                              </p>
                            </div>
                          ) : (
                            yearEvents.map((event, index) => {
                              const eventIndexStr = String(index + 1).padStart(2, "0");

                              return (
                                <motion.button
                                  key={event.id}
                                  type="button"
                                  initial={{ opacity: 0, y: 14 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -8 }}
                                  whileHover={{ y: -2 }}
                                  whileTap={{ scale: 0.995 }}
                                  transition={{
                                    duration: 0.38,
                                    delay: Math.min(index * 0.05, 0.25),
                                    ease: galleryEase,
                                  }}
                                  onClick={() => setSelectedEvent(event)}
                                  className="group relative flex w-full flex-col sm:flex-row h-auto sm:h-[260px] lg:h-[270px] overflow-hidden rounded-2xl border border-border/80 bg-card/90 shadow-sm transition-all duration-300 hover:border-primary/40 hover:bg-card hover:shadow-md text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                                  aria-label={`Open ${event.title} photo gallery`}
                                >
                                  {/* Large watermark number in top right corner matching reference image */}
                                  <span className="absolute top-2 right-6 font-mono text-6xl sm:text-7xl font-bold tracking-tighter text-foreground/5 dark:text-foreground/10 pointer-events-none select-none hidden sm:block">
                                    {eventIndexStr}
                                  </span>

                                  {/* Integrated Left Cover Image (~50% width on desktop, flush to top/bottom/left edges with zero padding) */}
                                  <motion.div
                                    layoutId={`poster-${event.id}`}
                                    transition={{ duration: 0.48, ease: galleryEase }}
                                    className="relative h-48 sm:h-full w-full sm:w-1/2 shrink-0 overflow-hidden bg-muted/80"
                                  >
                                    <img
                                      src={event.poster}
                                      alt={`${event.title} event poster`}
                                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.028]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-50 transition-opacity duration-300 group-hover:opacity-30" />
                                  </motion.div>

                                  {/* Right: Information Column (50% width on desktop) */}
                                  <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 lg:p-7 sm:w-1/2 relative z-10">
                                    <div>
                                      <p className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                                        EVENT / {eventIndexStr}
                                      </p>
                                      <motion.h3
                                        layoutId={`title-${event.id}`}
                                        className="mt-1.5 font-heading text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary"
                                      >
                                        {event.title}
                                      </motion.h3>
                                      {event.description && (
                                        <p className="mt-2 line-clamp-2 text-xs sm:text-sm leading-relaxed text-muted-foreground/90 max-w-md">
                                          {event.description}
                                        </p>
                                      )}
                                    </div>

                                    <div className="mt-4 sm:mt-6 flex items-center justify-between">
                                      <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground/80 bg-muted/50 px-2.5 py-1 rounded-md border border-border/40">
                                        <Images className="size-3.5 text-muted-foreground" />
                                        {event.images.length} {event.images.length === 1 ? "photograph" : "photographs"}
                                      </span>

                                      {/* Circular Arrow Button matching reference image */}
                                      <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105">
                                        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                      </div>
                                    </div>
                                  </div>
                                </motion.button>
                              );
                            })
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>
              );
            })}
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
