import { notFound } from "next/navigation";
import { EventDetailView } from "@/components/events/event-detail-view";
import { getEventById, countRegistrations } from "@/lib/data/events";

export default async function AdminEventPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) notFound();

  const registeredCount = event.registration_enabled
    ? await countRegistrations(event.id).catch(() => 0)
    : 0;

  return (
    <div className="-m-4 sm:-m-6 lg:-m-10">
      <div className="sticky top-0 z-10 border-b border-signal/30 bg-signal/10 px-4 py-2 text-center font-mono text-xs uppercase tracking-wider text-signal">
        Preview — status: {event.status} · not visible to the public unless published
      </div>
      <EventDetailView event={event} registeredCount={registeredCount} interactive={false} />
    </div>
  );
}
