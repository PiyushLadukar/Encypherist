import { notFound } from "next/navigation";
import { EventForm } from "@/components/admin/event-form";
import { getEventById } from "@/lib/data/events";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Edit event</h1>
      <div className="mt-8">
        <EventForm event={event} />
      </div>
    </div>
  );
}
