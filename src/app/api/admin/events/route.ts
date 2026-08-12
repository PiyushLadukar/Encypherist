import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireAdminApi } from "@/lib/admin-guard";
import { store } from "@/lib/store";
import { eventSchema } from "@/lib/validation/event";

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const body = await request.json().catch(() => null);
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid event data.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (store.events.some((e) => e.slug === parsed.data.slug)) {
    return NextResponse.json({ error: "An event with this slug already exists." }, { status: 409 });
  }

  const now = new Date().toISOString();
  const d = parsed.data;

  const event = {
    id: randomUUID(),
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
    created_at: now,
    updated_at: now,
  };

  store.events.push(event);

  return NextResponse.json({ event }, { status: 201 });
}
