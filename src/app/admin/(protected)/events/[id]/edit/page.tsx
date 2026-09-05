import { notFound } from "next/navigation";
import { getEventById } from "@/lib/data/admin-events";
import { EventForm } from "@/components/admin/event-form/event-form";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  return <EventForm initialEvent={event} />;
}
