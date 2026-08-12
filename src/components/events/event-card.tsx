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
        "group relative flex flex-col overflow-hidden border border-border bg-card transition-colors hover:border-primary/40",
        className
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-border bg-secondary">
        <PosterPlaceholder title={event.title} />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-full border border-border bg-background/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur">
            {eventTypeLabel(event.type)}
          </span>
          <ConfidenceBadge confidence={event.confidence} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="font-mono text-xs text-primary">
          <CalendarDays className="mr-1.5 inline size-3.5 -translate-y-px" />
          {formatDateRange(event.start_at, event.end_at)}
        </p>
        <h3 className="font-heading text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {event.title}
        </h3>
        {event.summary && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{event.summary}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          {event.location ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              {event.location}
            </span>
          ) : (
            <span />
          )}
          <span className="inline-flex items-center gap-1 font-mono text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
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
