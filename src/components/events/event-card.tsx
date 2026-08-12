import Link from "next/link";
import { CalendarDays, MapPin, ArrowUpRight, ImageOff } from "lucide-react";
import { ConfidenceBadge } from "@/components/site/confidence-badge";
import { formatDateRange, eventTypeLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Event } from "@/types/database";

export function EventCard({ event, className }: { event: Event; className?: string }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl dark:hover:shadow-primary/5",
        className
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border/60 bg-black/90">
        {event.poster_url ? (
          <div className="relative h-full w-full overflow-hidden">
            <img
              src={event.poster_url}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Subtle vignette gradient overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/20" />
          </div>
        ) : (
          <PosterPlaceholder title={event.title} />
        )}
        <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
          <span className="rounded-md border border-white/20 bg-black/60 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-white shadow-sm backdrop-blur-md">
            {eventTypeLabel(event.type)}
          </span>
          <ConfidenceBadge confidence={event.confidence} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <p className="flex items-center gap-1.5 font-mono text-xs font-medium text-primary">
          <CalendarDays className="size-3.5 text-primary" />
          {formatDateRange(event.start_at, event.end_at)}
        </p>
        <h3 className="font-heading text-xl font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
          {event.title}
        </h3>
        {event.summary && (
          <p className="line-clamp-2 text-sm text-muted-foreground/90 leading-relaxed">{event.summary}</p>
        )}
        <div className="mt-auto flex items-center justify-between border-t border-border/40 pt-3.5">
          {event.location ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <MapPin className="size-3.5 text-muted-foreground/70" />
              {event.location}
            </span>
          ) : (
            <span />
          )}
          <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-primary transition-transform duration-300 group-hover:translate-x-0.5">
            View
            <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * No verified event posters exist yet (docs/research.md §8) — this renders a
 * deterministic, on-brand placeholder from the title's hex bytes instead of a
 * generic stock image, so the slot is honest about being a placeholder while
 * still looking designed.
 */
export function PosterPlaceholder({ title }: { title: string }) {
  const bytes = Array.from(title)
    .slice(0, 6)
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"));

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[repeating-linear-gradient(135deg,var(--muted)_0px,var(--muted)_10px,var(--card)_10px,var(--card)_20px)]">
      <ImageOff className="size-4 text-muted-foreground/60" strokeWidth={1.5} />
      <div className="grid grid-cols-3 gap-x-3 gap-y-1 px-6 font-mono text-[11px] text-muted-foreground/70">
        {bytes.map((b, i) => (
          <span key={i}>0x{b}</span>
        ))}
      </div>
    </div>
  );
}
