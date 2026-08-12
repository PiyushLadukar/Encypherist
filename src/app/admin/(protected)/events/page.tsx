import Link from "next/link";
import { Plus } from "lucide-react";
import { EventsTable } from "@/components/admin/events-table";
import { getEvents } from "@/lib/data/events";

export default async function AdminEventsPage() {
  const events = await getEvents();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Events</h1>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 font-mono text-xs text-primary-foreground transition-colors hover:bg-primary/80"
        >
          <Plus className="size-4" />
          New event
        </Link>
      </div>
      <EventsTable events={events} />
    </div>
  );
}
