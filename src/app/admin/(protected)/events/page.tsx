import { Suspense } from "react";
import { listEvents } from "@/lib/data/admin-events";
import { EventsTable } from "@/components/admin/events-table";
import { EventsFilterBar } from "@/components/admin/events-filter-bar";
import { PaginationBar } from "@/components/admin/pagination-bar";
import type { EventDisplayStatus } from "@/types/models";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const status = (params.status as EventDisplayStatus | "all") || "all";

  const { events, total } = await listEvents({ search: params.search, status, page, pageSize: PAGE_SIZE });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">All Events</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create, publish and manage every event on the platform.</p>
      </div>

      <Suspense>
        <EventsFilterBar />
      </Suspense>

      <EventsTable events={events} />
      <Suspense>
        <PaginationBar page={page} pageSize={PAGE_SIZE} total={total} />
      </Suspense>
    </div>
  );
}
