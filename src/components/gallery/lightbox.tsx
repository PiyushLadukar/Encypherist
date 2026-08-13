"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { X, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { PosterPlaceholder } from "@/components/events/event-card";
import type { GalleryEntry } from "@/lib/data/gallery";

export function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: GalleryEntry[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const current = items[index];
  const reduceMotion = useReducedMotion();

  const goPrev = useCallback(
    () => onNavigate((index - 1 + items.length) % items.length),
    [index, items.length, onNavigate]
  );
  const goNext = useCallback(() => onNavigate((index + 1) % items.length), [index, items.length, onNavigate]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, goPrev, goNext]);

  if (!current) return null;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${current.event_title} gallery image`}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary/40"
      >
        <X className="size-5" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          goPrev();
        }}
        aria-label="Previous image"
        className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary/40 sm:left-6"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          goNext();
        }}
        aria-label="Next image"
        className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary/40 sm:right-6"
      >
        <ChevronRight className="size-5" />
      </button>

      <motion.div
        key={current.id}
        className="relative mx-4 flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden border border-border bg-card"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96, y: reduceMotion ? 0 : 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative aspect-[4/3] w-full">
          <PosterPlaceholder title={current.caption ?? current.event_title} />
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border p-4">
          <div className="min-w-0">
            <p className="truncate font-heading text-sm font-semibold text-foreground">
              {current.caption ?? current.event_title}
            </p>
            <p className="font-mono text-xs text-muted-foreground">{current.event_title}</p>
          </div>
          <Link
            href={`/events/${current.event_slug}`}
            className="inline-flex shrink-0 items-center gap-1 font-mono text-xs text-primary"
          >
            Event
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
