import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-guard";
import { store } from "@/lib/store";
import { eventSchema } from "@/lib/validation/event";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  const index = store.events.findIndex((e) => e.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid event data.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (store.events.some((e) => e.slug === parsed.data.slug && e.id !== id)) {
    return NextResponse.json({ error: "An event with this slug already exists." }, { status: 409 });
  }

  const d = parsed.data;
  store.events[index] = {
    ...store.events[index],
    slug: d.slug,
    title: d.title,
    type: d.type,
    status: d.status,
    registration_enabled: d.registration_enabled,
    schedule: d.schedule,
    confidence: d.confidence,
    summary: d.summary || null,
    description: d.description || null,
    location: d.location || null,
    poster_url: d.poster_url || null,
    eligibility: d.eligibility || null,
    rules: d.rules || null,
    start_at: d.start_at || null,
    end_at: d.end_at || null,
    registration_deadline: d.registration_deadline || null,
    capacity: d.capacity ?? null,
    updated_at: new Date().toISOString(),
  };

  return NextResponse.json({ event: store.events[index] });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  const index = store.events.findIndex((e) => e.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  store.events.splice(index, 1);
  store.eventGallery = store.eventGallery.filter((g) => g.event_id !== id);
  store.eventFaqs = store.eventFaqs.filter((f) => f.event_id !== id);
  store.eventSpeakers = store.eventSpeakers.filter((s) => s.event_id !== id);
  store.eventOrganizers = store.eventOrganizers.filter((o) => o.event_id !== id);
  store.eventRegistrations = store.eventRegistrations.filter((r) => r.event_id !== id);

  return NextResponse.json({ success: true });
}
