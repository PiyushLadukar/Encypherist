import Link from "next/link";
import { CalendarDays, Users, ClipboardList, Radio, Box, Plus } from "lucide-react";
import { getDashboardStats } from "@/lib/data/admin";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Members", value: stats.memberCount, icon: Users, href: "/admin/members" },
    { label: "Total events", value: stats.eventCount, icon: CalendarDays, href: "/admin/events" },
    { label: "Published events", value: stats.publishedEventCount, icon: Radio, href: "/admin/events" },
    { label: "Projects", value: stats.projectCount, icon: Box, href: "/admin/projects" },
    {
      label: "Registrations",
      value: stats.registrationCount,
      icon: ClipboardList,
      href: "/admin/registrations",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Overview of Encypherist&apos;s content.</p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 font-mono text-xs text-primary-foreground transition-colors hover:bg-primary/80"
        >
          <Plus className="size-4" />
          New event
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <card.icon className="size-5 text-primary" />
            <p className="mt-3 font-heading text-3xl font-semibold text-foreground">
              {card.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
