import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "@/components/site/confidence-badge";
import { PosterPlaceholder } from "@/components/events/event-card";
import { Countdown } from "@/components/events/countdown";
import { formatDateRange, eventTypeLabel, isPast } from "@/lib/format";
import type { EventWithDetails } from "@/types/database";

function registrationState(
  event: Pick<EventWithDetails, "registration_enabled" | "registration_deadline" | "capacity" | "status">,
  registeredCount: number
) {
  if (event.status !== "published") return { open: false, reason: "This event isn't published yet." };
  if (!event.registration_enabled) return { open: false, reason: "Registration isn't open for this event." };
  if (event.registration_deadline && isPast(event.registration_deadline)) {
    return { open: false, reason: "Registration has closed." };
  }
  if (event.capacity && registeredCount >= event.capacity) {
    return { open: false, reason: "This event is full." };
  }
  return { open: true, reason: null as string | null };
}

/**
 * The full event page body — used by both the live public event route and
 * the admin "preview before publish" route, so a preview always matches
 * production exactly (spec §28).
 */
export function EventDetailView({
  event,
  registeredCount,
  interactive = true,
}: {
  event: EventWithDetails;
  registeredCount: number;
  /** false in admin preview: no live registration CTA on unpublished content. */
  interactive?: boolean;
}) {
  const registration = registrationState(event, registeredCount);

  return (
    <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden border border-border">
            <PosterPlaceholder title={event.title} />
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border bg-card px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {eventTypeLabel(event.type)}
            </span>
            <ConfidenceBadge confidence={event.confidence} />
          </div>

          <h1 className="mt-4 text-balance font-heading text-4xl font-semibold tracking-tight text-foreground">
            {event.title}
          </h1>

          <div className="mt-5 space-y-2.5 font-mono text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              {formatDateRange(event.start_at, event.end_at)}
            </p>
            {event.location && (
              <p className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                {event.location}
              </p>
            )}
            {event.registration_enabled && (
              <p className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                {registeredCount}
                {event.capacity ? ` / ${event.capacity}` : ""} registered
              </p>
            )}
          </div>

          {event.start_at && !isPast(event.start_at) && (
            <div className="mt-6 border border-dashed border-border p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                T-MINUS
              </p>
              <div className="mt-2">
                <Countdown target={event.start_at} />
              </div>
            </div>
          )}

          <div className="mt-8">
            {registration.open ? (
              <Button
                size="lg"
                className="font-mono text-sm"
                disabled={!interactive}
                render={interactive ? <Link href={`/events/${event.slug}/register`} /> : undefined}
              >
                Register now
                <ArrowUpRight className="size-4" />
              </Button>
            ) : (
              event.registration_enabled && (
                <p className="rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                  {registration.reason}
                </p>
              )
            )}
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-14 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-12">
          {event.description && (
            <section>
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                About
              </h2>
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                {event.description}
              </p>
            </section>
          )}

          {event.schedule.length > 0 && (
            <section>
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Schedule
              </h2>
              <ol className="mt-4 space-y-4 border-l border-border pl-5">
                {event.schedule.map((item, i) => (
                  <li key={i}>
                    {item.time && <p className="font-mono text-xs text-primary">{item.time}</p>}
                    <p className="font-heading text-base font-semibold text-foreground">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {event.rules && (
            <section>
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Rules
              </h2>
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                {event.rules}
              </p>
            </section>
          )}

          {event.faqs.length > 0 && (
            <section>
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                FAQ
              </h2>
              <div className="mt-4 divide-y divide-border border-y border-border">
                {event.faqs.map((faq) => (
                  <details key={faq.id} className="group py-4">
                    <summary className="cursor-pointer list-none font-heading text-base font-medium text-foreground marker:content-none">
                      {faq.question}
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {event.gallery.length > 0 && (
            <section>
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Gallery
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {event.gallery.map((item) => (
                  <div
                    key={item.id}
                    className="aspect-square overflow-hidden rounded-md border border-border"
                  >
                    <PosterPlaceholder title={item.caption ?? event.title} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-10">
          {event.eligibility && (
            <div>
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Eligibility
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {event.eligibility}
              </p>
            </div>
          )}

          {event.speakers.length > 0 && (
            <div>
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Speakers
              </h2>
              <ul className="mt-3 space-y-3">
                {event.speakers.map((speaker) => (
                  <li key={speaker.id}>
                    <p className="font-heading text-sm font-semibold text-foreground">
                      {speaker.name}
                    </p>
                    {speaker.title && <p className="text-xs text-muted-foreground">{speaker.title}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {event.organizers.length > 0 && (
            <div>
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Organizers
              </h2>
              <ul className="mt-3 space-y-3">
                {event.organizers.map((organizer) => (
                  <li key={organizer.id}>
                    <p className="font-heading text-sm font-semibold text-foreground">
                      {organizer.name}
                    </p>
                    {organizer.role && (
                      <p className="text-xs text-muted-foreground">{organizer.role}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
