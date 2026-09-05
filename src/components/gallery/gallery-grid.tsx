"use client";

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
    </>
  );
}

export { HeroLineArt, LocatorGlyph };
