import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { EventDetailView } from "@/components/events/event-detail-view";
import { ComingSoonEvent } from "@/components/events/coming-soon-event";
import { getEventBySlug, countRegistrations } from "@/lib/data/events";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug).catch(() => null);
  if (!event) return { title: "Event not found — Encypherist" };
  return {
    title: `${event.title} — Encypherist`,
    description: event.summary ?? undefined,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug).catch(() => null);

  if (!event) notFound();

  const registeredCount = event.registration_enabled
    ? await countRegistrations(event.id).catch(() => 0)
    : 0;

  return (
    <div>
      <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          All events
        </Link>
      </div>
      {event.start_at ? (
        <EventDetailView event={event} registeredCount={registeredCount} />
      ) : (
        <ComingSoonEvent event={event} />
      )}
    </div>
  );
}
