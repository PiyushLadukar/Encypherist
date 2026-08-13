"use client";

import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryEvent } from "@/data/gallery";

export function Lightbox({ event, index, onClose, onNavigate }: { event: GalleryEvent; index: number; onClose: () => void; onNavigate: (index: number) => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const image = event.images[index];
  const goPrevious = useCallback(() => onNavigate((index - 1 + event.images.length) % event.images.length), [event.images.length, index, onNavigate]);
  const goNext = useCallback(() => onNavigate((index + 1) % event.images.length), [event.images.length, index, onNavigate]);

  useEffect(() => {
    function onKeyDown(keyboardEvent: KeyboardEvent) {
      if (keyboardEvent.key === "Escape") onClose();
      if (keyboardEvent.key === "ArrowLeft") goPrevious();
      if (keyboardEvent.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [goNext, goPrevious, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${event.title} photo viewer`}
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 p-3 backdrop-blur-sm sm:p-6"
        onClick={onClose}
      >
        <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close photo viewer" className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full border border-border bg-background/85 text-foreground transition-colors hover:border-primary/40 sm:right-6 sm:top-6"><X className="size-5" /></button>
        <button type="button" onClick={(clickEvent) => { clickEvent.stopPropagation(); goPrevious(); }} aria-label="Previous photo" className="absolute left-2 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/85 text-foreground transition-colors hover:border-primary/40 sm:left-6 sm:size-11"><ChevronLeft className="size-5" /></button>
        <button type="button" onClick={(clickEvent) => { clickEvent.stopPropagation(); goNext(); }} aria-label="Next photo" className="absolute right-2 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/85 text-foreground transition-colors hover:border-primary/40 sm:right-6 sm:size-11"><ChevronRight className="size-5" /></button>
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.985 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex max-h-full w-full max-w-6xl flex-col overflow-hidden border border-border bg-card shadow-2xl"
          onClick={(clickEvent) => clickEvent.stopPropagation()}
        >
          <div className="flex min-h-0 flex-1 items-center justify-center bg-black/20">
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={image}
                src={image}
                alt={`${event.title} photograph ${index + 1}`}
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="max-h-[calc(100vh-11rem)] max-w-full object-contain"
              />
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border p-4">
            <p className="truncate font-heading text-sm font-semibold text-foreground">{event.title}</p>
            <p className="shrink-0 font-mono text-xs text-muted-foreground">
              {String(index + 1).padStart(2, "0")} / {String(event.images.length).padStart(2, "0")}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
