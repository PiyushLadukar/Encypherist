import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { RegistrationForm } from "@/components/events/registration-form";
import { getEventBySlug, countRegistrations } from "@/lib/data/events";
import { formatDateRange, isPast } from "@/lib/format";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug).catch(() => null);
  return { title: event ? `Register — ${event.title} — Encypherist` : "Event not found — Encypherist" };
}

export default async function EventRegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug).catch(() => null);

  if (!event) notFound();

  let closedReason: string | null = null;
  if (event.status !== "published") closedReason = "This event isn't published yet.";
  else if (!event.registration_enabled) closedReason = "Registration isn't open for this event.";
  else if (event.registration_deadline && isPast(event.registration_deadline))
    closedReason = "Registration has closed.";
  else if (event.capacity) {
    const count = await countRegistrations(event.id).catch(() => 0);
    if (count >= event.capacity) closedReason = "This event is full.";
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20 sm:px-6 lg:px-8">
      <Link
        href={`/events/${event.slug}`}
        className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to event
      </Link>

      <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-primary">Register</p>
      <h1 className="mt-2 text-balance font-heading text-3xl font-semibold tracking-tight text-foreground">
        {event.title}
      </h1>
      <p className="mt-1 font-mono text-sm text-muted-foreground">
        {formatDateRange(event.start_at, event.end_at)}
      </p>

      <div className="mt-10">
        {closedReason ? (
          <p className="rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            {closedReason}
          </p>
        ) : (
          <RegistrationForm eventSlug={event.slug} eventTitle={event.title} />
        )}
      </div>
    </div>
  );
}
