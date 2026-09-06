import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEventById } from "@/lib/data/admin-events";
import {
  getRegistrationStats,
  listRegistrations,
  listDistinctDepartmentsAndYears,
  listTeamRegistrations,
  listAllRegistrationsForExport,
} from "@/lib/data/registrations";
import { buildExportRows } from "@/lib/export";
import { ParticipantStatsCards } from "@/components/admin/participants/stats-cards";
import { ParticipantFiltersBar } from "@/components/admin/participants/filters-bar";
import { ParticipantsTable } from "@/components/admin/participants/participants-table";
import { TeamsTable } from "@/components/admin/participants/teams-table";
import { FormResponsesTable } from "@/components/admin/participants/form-responses-table";
import { ExportButtons } from "@/components/admin/participants/export-buttons";
import { PaginationBar } from "@/components/admin/pagination-bar";
import type { RegistrationStatus } from "@/types/models";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function EventParticipantsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    search?: string;
    status?: string;
    type?: string;
    department?: string;
    year?: string;
    page?: string;
  }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);

  const [stats, facets, { registrations, total }, teams, allForExport] = await Promise.all([
    getRegistrationStats(id),
    listDistinctDepartmentsAndYears(id),
    listRegistrations({
      eventId: id,
      search: query.search,
      department: query.department,
      year: query.year,
      status: (query.status as RegistrationStatus | "all") || "all",
      registrationType: (query.type as "individual" | "team" | "all") || "all",
      page,
      pageSize: PAGE_SIZE,
    }),
    listTeamRegistrations(id),
    listAllRegistrationsForExport(id),
  ]);

  const { headers, rows } = buildExportRows(event, allForExport);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> All events
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-heading text-2xl font-semibold text-foreground">{event.name}</h1>
          <ExportButtons eventId={id} />
        </div>
      </div>

      <ParticipantStatsCards stats={stats} />

      <Tabs defaultValue="participants">
        <TabsList variant="line">
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="responses">Form Responses</TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="mt-6 space-y-4">
          <Suspense>
            <ParticipantFiltersBar departments={facets.departments} years={facets.years} />
          </Suspense>
          <ParticipantsTable registrations={registrations} />
          <Suspense>
            <PaginationBar page={page} pageSize={PAGE_SIZE} total={total} />
          </Suspense>
        </TabsContent>

        <TabsContent value="teams" className="mt-6">
          <TeamsTable teams={teams} />
        </TabsContent>

        <TabsContent value="responses" className="mt-6">
          <FormResponsesTable headers={headers} rows={rows} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
