import { Suspense } from "react";
import { listEvents } from "@/lib/data/admin-events";
import { EventsTable } from "@/components/admin/events-table";
import { PaginationBar } from "@/components/admin/pagination-bar";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function ArchivedEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { events, total } = await listEvents({ status: "archived", page, pageSize: PAGE_SIZE });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Archived Events</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Archived events stay off the public site but keep their registration history.
        </p>
      </div>

      <EventsTable events={events} />
      <Suspense>
        <PaginationBar page={page} pageSize={PAGE_SIZE} total={total} />
      </Suspense>
    </div>
  );
}
