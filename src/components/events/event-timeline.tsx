import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { ConfidenceBadge } from "@/components/site/confidence-badge";
import { Stagger, StaggerItem } from "@/components/site/reveal";
import { formatDateRange, eventTypeLabel, eventNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Event } from "@/types/database";

function statusFor(event: Event): { label: string; className: string } {
  if (!event.start_at) {
    return { label: "ANNOUNCED", className: "bg-signal text-signal-foreground" };
  }
  if (event.registration_enabled) {
    return { label: "REGISTRATION_OPEN", className: "bg-primary text-primary-foreground" };
  }
  return { label: "UPCOMING", className: "bg-muted text-foreground" };
}

export function EventTimeline({ events }: { events: Event[] }) {
  return (
    <Stagger as="ol" className="relative border-l-2 border-border pl-8 sm:pl-10" stagger={0.1}>
      {events.map((event, i) => {
        const status = statusFor(event);
        return (
          <StaggerItem
            as="li"
            key={event.id}
            className={cn("relative", i !== events.length - 1 && "pb-14")}
          >
            <span
              className={cn(
                "absolute -left-[41px] top-1.5 size-3 border-2 border-background sm:-left-[49px]",
                event.registration_enabled ? "bg-primary" : "bg-signal"
              )}
            />
            <div className="border border-border p-6 transition-colors hover:border-primary/40 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/70">
                  {`REF_LOG // ${eventNumber(i)}`}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                    status.className
                  )}
                >
                  {status.label}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <h3 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
                  {event.title}
                </h3>
                <ConfidenceBadge confidence={event.confidence} />
              </div>
              <span className="mt-3 block h-0.5 w-12 bg-signal" />

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-muted-foreground">
                <span className="text-primary">
                  {`DATE // ${formatDateRange(event.start_at, event.end_at)}`}
                </span>
                {event.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {event.location}
                  </span>
                )}
                <span>{eventTypeLabel(event.type).toUpperCase()}</span>
              </div>

              {event.summary && (
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {event.summary}
                </p>
              )}

              <Link
                href={`/events/${event.slug}`}
                className="mt-6 inline-flex items-center gap-1 font-mono text-xs text-primary"
              >
                View details
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
