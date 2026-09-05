import { NextResponse } from "next/server";
import { getCollections } from "@/lib/mongodb";
import { getEventBySlugAdmin } from "@/lib/data/admin-events";
import { isRegistrationOpen } from "@/lib/event-status";
import { buildRegistrationSchema, checkEligibility } from "@/lib/validation/registration";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const event = await getEventBySlugAdmin(slug);
  if (!event || event.status !== "published") {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const registrationState = isRegistrationOpen(event);
  if (!registrationState.open) {
    return NextResponse.json({ error: registrationState.reason }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Never trust the client's declared registration type/team size/required
  // fields — re-derive and re-validate the whole schema from the event's
  // live server-side configuration.
  const schema = buildRegistrationSchema(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form for errors.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const responsible = data.registrationType === "team" ? data.team.leader : data.individual;
  const eligibility = checkEligibility(event, responsible);
  if (!eligibility.eligible) {
    return NextResponse.json({ error: eligibility.reason }, { status: 403 });
  }

  const { registrations } = await getCollections();
  const email = responsible.email.toLowerCase();
  const duplicate = await registrations.findOne({
    eventId: event.id,
    deletedAt: null,
    $or: [{ "individual.email": email }, { "team.leader.email": email }],
  });
  if (duplicate) {
    return NextResponse.json(
      { error: "You've already registered for this event with this email." },
      { status: 409 }
    );
  }

  const now = new Date();
  await registrations.insertOne({
    eventId: event.id,
    registrationType: data.registrationType,
    status: "pending",
    deletedAt: null,
    formVersion: event.registrationForm.version,
    formSnapshot: event.registrationForm.fields,
    responses: data.responses,
    individual: data.registrationType === "individual" ? data.individual : null,
    team: data.registrationType === "team" ? data.team : null,
    submittedAt: now,
    updatedAt: now,
    updatedBy: null,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
