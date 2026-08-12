import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { store } from "@/lib/store";
import { registrationSchema } from "@/lib/validation/registration";
import { isPast } from "@/lib/format";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form for errors.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const event = store.events.find((e) => e.slug === slug);

  if (!event || event.status !== "published") {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }
  if (!event.registration_enabled) {
    return NextResponse.json({ error: "Registration isn't open for this event." }, { status: 403 });
  }
  if (event.registration_deadline && isPast(event.registration_deadline)) {
    return NextResponse.json({ error: "Registration has closed." }, { status: 403 });
  }

  const existingCount = store.eventRegistrations.filter((r) => r.event_id === event.id).length;
  if (event.capacity && existingCount >= event.capacity) {
    return NextResponse.json({ error: "This event is full." }, { status: 403 });
  }

  const { branch, year, ...rest } = parsed.data;

  const alreadyRegistered = store.eventRegistrations.some(
    (r) => r.event_id === event.id && r.email.toLowerCase() === rest.email.toLowerCase()
  );
  if (alreadyRegistered) {
    return NextResponse.json(
      { error: "You've already registered for this event with this email." },
      { status: 409 }
    );
  }

  store.eventRegistrations.push({
    id: randomUUID(),
    event_id: event.id,
    ...rest,
    branch: branch || null,
    year: year || null,
    extra: {},
    created_at: new Date().toISOString(),
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
