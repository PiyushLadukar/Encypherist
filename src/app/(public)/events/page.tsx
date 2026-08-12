import type { Metadata } from "next";
import { SectionHeading } from "@/components/site/section-heading";
import { EventDirectory } from "@/components/events/event-directory";
import { getPublishedEvents, splitUpcomingPast } from "@/lib/data/events";

export const metadata: Metadata = {
  title: "Events — Encypherist",
  description: "Workshops, hackathons, talks and competitions from Encypherist, JIT Nagpur.",
};

export const revalidate = 0;

export default async function EventsPage() {
  const events = await getPublishedEvents().catch(() => []);
  const { upcoming, past, announced } = splitUpcomingPast(events);

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Everything, logged"
        title="Workshops, hackathons, talks and the occasional donation drive."
        description="Every event below traces back to a verified source — see docs/research.md for the trail."
      />

      {events.length === 0 ? (
        <p className="mt-16 text-sm text-muted-foreground">
          Event data isn&apos;t connected yet — once the database is live, the full archive
          will appear here.
        </p>
      ) : (
        <div className="mt-10">
          <EventDirectory upcoming={upcoming} past={past} announced={announced} />
        </div>
      )}
    </div>
  );
}
