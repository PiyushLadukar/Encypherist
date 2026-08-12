import { RegistrationsTable } from "@/components/admin/registrations-table";
import { RegistrationsFilter } from "@/components/admin/registrations-filter";
import { getRegistrations } from "@/lib/data/admin";
import { getEvents } from "@/lib/data/events";

export default async function AdminRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const { event: eventId } = await searchParams;
  const [registrations, events] = await Promise.all([getRegistrations(eventId), getEvents()]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Registrations</h1>
        <RegistrationsFilter events={events} />
      </div>
      <RegistrationsTable registrations={registrations} />
    </div>
  );
}
