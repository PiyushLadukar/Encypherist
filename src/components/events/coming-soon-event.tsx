import Link from "next/link";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { ConfidenceBadge } from "@/components/site/confidence-badge";
import { Reveal } from "@/components/site/reveal";
import { eventTypeLabel } from "@/lib/format";
import type { Event } from "@/types/database";

/**
 * Stands in for the full `EventDetailView` when an event has been announced
 * but has no `start_at` yet — there's nothing to show a schedule, countdown
 * or registration CTA for, so rather than render a mostly-empty detail page
 * this is upfront that the rest is still being worked out.
 */
export function ComingSoonEvent({ event }: { event: Event }) {
  return (
    <Reveal className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-full border border-border bg-card px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {eventTypeLabel(event.type)}
        </span>
        <ConfidenceBadge confidence={event.confidence} />
      </div>

      <h1 className="mt-5 text-balance font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        {event.title}
      </h1>

      {event.summary && (
        <p className="mx-auto mt-4 max-w-lg text-balance text-base leading-relaxed text-muted-foreground">
          {event.summary}
        </p>
      )}

      <div className="mx-auto mt-12 w-fit rounded-2xl border-2 border-dashed border-border px-10 py-12 sm:px-16">
        <CalendarClock className="mx-auto size-8 text-primary" />
        <p className="mt-4 font-heading text-2xl font-bold uppercase tracking-[0.15em] text-foreground">
          Coming soon<span className="text-primary">_</span>
        </p>
        <p className="mt-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Dates, details and registration land here once confirmed
        </p>
      </div>

      <Link
        href="/events"
        className="mt-10 inline-flex items-center gap-1.5 font-mono text-xs text-primary transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to all events
      </Link>
    </Reveal>
  );
}
