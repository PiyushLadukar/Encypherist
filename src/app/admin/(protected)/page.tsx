import Link from "next/link";
import { CalendarDays, Clock, Radio, CheckCircle2, Users, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getDashboardStats,
  getRegistrationsPerEvent,
  getUpcomingEvents,
  getRecentlyCreatedEvents,
  getRecentRegistrations,
} from "@/lib/data/admin-events";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, perEvent, upcoming, recentEvents, recentRegistrations] = await Promise.all([
    getDashboardStats(),
    getRegistrationsPerEvent(6),
    getUpcomingEvents(5),
    getRecentlyCreatedEvents(5),
    getRecentRegistrations(8),
  ]);

  const cards = [
    { label: "Total Events", value: stats.total, icon: CalendarDays },
    { label: "Upcoming Events", value: stats.upcoming, icon: Clock },
    { label: "Ongoing Events", value: stats.ongoing, icon: Radio },
    { label: "Completed Events", value: stats.completed, icon: CheckCircle2 },
    { label: "Total Registrations", value: stats.totalRegistrations, icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">A snapshot of the Encypherist event platform.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex flex-col gap-2">
              <card.icon className="size-4 text-primary" />
              <p className="text-2xl font-semibold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Registrations per event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {perEvent.length === 0 && <p className="text-sm text-muted-foreground">No events yet.</p>}
            {perEvent.map(({ event, count }) => (
              <Link
                key={event.id}
                href={`/admin/events/${event.id}/participants`}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-primary/40"
              >
                <span className="truncate text-foreground">{event.name}</span>
                <Badge variant="outline">{count}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.length === 0 && <p className="text-sm text-muted-foreground">Nothing scheduled yet.</p>}
            {upcoming.map((event) => (
              <Link
                key={event.id}
                href={`/admin/events/${event.id}/edit`}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-primary/40"
              >
                <span className="truncate text-foreground">{event.name}</span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {event.startDate ? new Date(event.startDate).toLocaleDateString("en-IN") : "—"}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recently created events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentEvents.length === 0 && <p className="text-sm text-muted-foreground">No events yet.</p>}
            {recentEvents.map((event) => (
              <Link
                key={event.id}
                href={`/admin/events/${event.id}/edit`}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-primary/40"
              >
                <span className="truncate text-foreground">{event.name}</span>
                <Badge variant="outline" className="capitalize">
                  {event.status}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recently registered participants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentRegistrations.length === 0 && <p className="text-sm text-muted-foreground">No registrations yet.</p>}
            {recentRegistrations.map(({ registration, eventName }) => {
              const person = registration.registrationType === "team" ? registration.team?.leader : registration.individual;
              return (
                <Link
                  key={registration.id}
                  href={`/admin/events/${registration.eventId}/participants`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-primary/40"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-foreground">{person?.name ?? "—"}</span>
                    <span className="block truncate text-xs text-muted-foreground">{eventName}</span>
                  </span>
                  <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
