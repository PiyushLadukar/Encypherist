"use client";

<<<<<<< HEAD
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
=======
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, useSpring } from "motion/react";
import { ArrowUpRight, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryEvent } from "@/data/gallery";

const galleryEase = [0.22, 1, 0.36, 1] as const;
const RAIL_TRACK_HEIGHT = 240;

/**
 * Tracks which event card is nearest the vertical center of the viewport —
 * drives the left index rail and the active EVENT/NN highlight. A thin
 * intersection band (not the whole viewport) so exactly one card reads as
 * "active" at a time during a scroll.
 */
function useActiveEvent(count: number) {
  const [active, setActive] = useState(0);
  const nodesRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = nodesRef.current.findIndex((el) => el === entry.target);
          if (idx !== -1) setActive(idx);
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );
    nodesRef.current.slice(0, count).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [count]);

  const register = (i: number) => (el: HTMLElement | null) => {
    nodesRef.current[i] = el;
  };

  return { active, register };
}

/** Sticky left index rail: "01" marker, a track, and a dot that eases to the active event's position. */
function IndexRail({ active, total }: { active: number; total: number }) {
  const progress = total > 1 ? active / (total - 1) : 0;
  const dotY = useSpring(progress * RAIL_TRACK_HEIGHT, { stiffness: 160, damping: 26, mass: 0.5 });
  const fillScale = useSpring(progress, { stiffness: 160, damping: 26, mass: 0.5 });

  return (
    <div className="sticky top-40 hidden w-12 shrink-0 flex-col items-center lg:flex">
      <span className="font-mono text-xs text-muted-foreground/70">{String(active + 1).padStart(2, "0")}</span>
      <span className="mt-2 h-3 w-px bg-border" />
      <div className="relative mt-1 w-px bg-border/60" style={{ height: RAIL_TRACK_HEIGHT }}>
        <motion.div
          className="absolute left-0 top-0 w-px bg-primary/50"
          style={{ height: RAIL_TRACK_HEIGHT, scaleY: fillScale, transformOrigin: "top" }}
        />
        <motion.span
          aria-hidden="true"
          className="absolute -left-[3px] size-[7px] rounded-full bg-primary shadow-[0_0_0_4px_var(--background)]"
          style={{ y: dotY }}
        />
      </div>
    </div>
  );
}

function EventRow({
  event,
  index,
  total,
  isActive,
  registerNode,
}: {
  event: GalleryEvent;
  index: number;
  total: number;
  isActive: boolean;
  registerNode: (el: HTMLDivElement | null) => void;
}) {
  const reduceMotion = useReducedMotion();
  const number = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      ref={registerNode}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: reduceMotion ? 0.3 : 0.6, ease: galleryEase }}
      whileHover={{ y: -3 }}
      className="group relative"
    >
      <Link
        href={`/gallery/${event.id}`}
        className="relative flex w-full flex-col items-stretch overflow-hidden rounded-2xl border border-border/70 bg-card text-left shadow-[0_1px_10px_-4px_rgba(0,0,0,0.06)] transition-shadow duration-500 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.22)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:flex-row"
        aria-label={`Open ${event.title} photo gallery`}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-auto sm:w-[54%]">
          <motion.img
            src={event.poster}
            alt={`${event.title} event photograph`}
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div className="relative flex flex-1 flex-col justify-between gap-6 p-6 sm:p-8">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-1 -top-3 select-none font-heading text-7xl font-bold text-foreground/[0.04] sm:text-8xl"
          >
            {number}
          </span>

          <div className="relative">
            <p
              className={cn(
                "font-mono text-[11px] font-medium uppercase tracking-[0.22em] transition-colors duration-500",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              Event / {number}
            </p>
            <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {event.title}
            </h2>
            <span className="mt-4 block h-px w-8 bg-border" />
          </div>

          <div className="relative flex items-end justify-end">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/[0.06] text-primary transition-all duration-300 group-hover:border-primary/50 group-hover:bg-primary/10">
              <ArrowUpRight className="size-4.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/** Small recurring cartographic glyph — ties the hero's coordinate readout together with a matching mark near the bottom of the page. */
function LocatorGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.7" />
      <path d="M12 1v4M12 19v4M1 12h4M19 12h4" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

/** Faint flowing line-art for the hero — decorative only, echoes the site's technical/cartographic identity. */
function HeroLineArt() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 480 260"
      className="pointer-events-none absolute -right-6 -top-4 hidden h-auto w-[30rem] text-foreground/[0.09] sm:block"
      fill="none"
    >
      <path d="M20 40 C 140 10, 200 120, 320 70 S 460 140, 460 40" stroke="currentColor" strokeWidth="1" />
      <path d="M0 110 C 120 90, 220 200, 340 150 S 480 190, 480 110" stroke="currentColor" strokeWidth="1" />
      <circle cx="320" cy="70" r="2.5" className="fill-primary/40" />
      <circle cx="120" cy="26" r="1.5" fill="currentColor" />
      <circle cx="420" cy="150" r="1.5" fill="currentColor" />
    </svg>
  );
}

function ScrollToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ duration: 0.3, ease: galleryEase }}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-30 flex size-11 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-md backdrop-blur-md transition-colors hover:border-primary/40 hover:text-primary"
        >
          <ArrowUp className="size-4.5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function GalleryGrid({ events }: { events: GalleryEvent[] }) {
  const { active, register } = useActiveEvent(events.length);
>>>>>>> b2e2bd8b4405b847f22d0917cc6889a9b004a09e

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
<<<<<<< HEAD
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
=======
      <div className="relative mx-auto flex max-w-5xl gap-8">
        <IndexRail active={active} total={events.length} />

        <div className="flex min-w-0 flex-1 flex-col gap-6 sm:gap-7">
          {events.map((event, index) => (
            <EventRow
              key={event.id}
              event={event}
              index={index}
              total={events.length}
              isActive={index === active}
              registerNode={register(index)}
            />
          ))}
        </div>
      </div>

      <LocatorGlyph className="pointer-events-none fixed bottom-6 left-6 z-10 hidden size-5 text-muted-foreground/40 lg:block" />
      <ScrollToTop />
>>>>>>> b2e2bd8b4405b847f22d0917cc6889a9b004a09e
    </>
  );
}

export { HeroLineArt, LocatorGlyph };
