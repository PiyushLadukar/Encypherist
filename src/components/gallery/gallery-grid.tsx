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

export function GalleryGrid({ events }: { events: GalleryEvent[] }) {
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
                  Event archive • {selectedEvent.academicYear || "2025–26"}
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
            key="gallery-years-list"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: galleryEase }}
            className="mx-auto max-w-5xl space-y-12 sm:space-y-16"
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
                    className="group flex w-full items-center justify-between py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                    aria-expanded={isOpen}
                  >
                    <h2 className="font-heading text-2xl sm:text-4xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                      {formatYearLabel(year)}
                    </h2>
                    <div className="flex items-center gap-4 sm:gap-6">
                      <span className="font-mono text-xs sm:text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground group-hover:text-foreground transition-colors">
                        {countText}
                      </span>
                      <span className="flex size-7 items-center justify-center font-mono text-lg font-normal text-muted-foreground transition-colors group-hover:text-primary">
                        {isOpen ? "−" : "+"}
                      </span>
                    </div>
                  </button>
                  <div className="h-px w-full bg-border/60 mb-6 sm:mb-8" />

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.36, ease: galleryEase }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-6 sm:space-y-8 pb-4">
                          {yearEvents.length === 0 ? (
                            <div className="border border-dashed border-border/50 px-6 py-12 text-center bg-card/30">
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
                                  className="group relative flex w-full flex-col gap-6 rounded-xl border border-border/40 bg-card/60 p-5 text-left transition-all duration-300 hover:border-primary/40 hover:bg-card hover:shadow-xl sm:p-6 lg:flex-row lg:items-center lg:justify-between focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                                  aria-label={`Open ${event.title} photo gallery`}
                                >
                                  {/* Left: Event Information */}
                                  <div className="flex flex-1 flex-col justify-center lg:pr-6">
                                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary/80 font-medium">
                                      {eventIndexStr} / {event.title}
                                    </p>
                                    <motion.h3
                                      layoutId={`title-${event.id}`}
                                      className="mt-1.5 font-heading text-xl sm:text-2xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary"
                                    >
                                      {event.title}
                                    </motion.h3>
                                    {event.description && (
                                      <p className="mt-2 line-clamp-2 text-xs sm:text-sm leading-6 text-muted-foreground/90">
                                        {event.description}
                                      </p>
                                    )}
                                    <div className="mt-4 flex items-center gap-3">
                                      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground bg-muted/60 px-2.5 py-1 rounded border border-border/40">
                                        <Images className="size-3 text-muted-foreground/80" />
                                        {event.images.length} {event.images.length === 1 ? "photo" : "photos"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Right: Enlarged Event Poster Image (~35-40% width on desktop) */}
                                  <motion.div
                                    layoutId={`poster-${event.id}`}
                                    transition={{ duration: 0.48, ease: galleryEase }}
                                    className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-border/50 bg-muted/80 lg:w-[38%] shrink-0 transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-md"
                                  >
                                    <img
                                      src={event.poster}
                                      alt={`${event.title} event poster`}
                                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />
                                  </motion.div>

                                  {/* Far Right: Arrow Action */}
                                  <div className="hidden shrink-0 pl-2 lg:block">
                                    <ArrowUpRight className="size-5 text-muted-foreground/70 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary" />
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
