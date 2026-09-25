import { NextResponse } from "next/server";
import { getCollections } from "@/lib/mongodb";
import { getEventBySlugAdmin } from "@/lib/data/admin-events";
import { isRegistrationOpen } from "@/lib/event-status";
import { buildRegistrationSchema, checkEligibility } from "@/lib/validation/registration";
import { splitFields, deriveParticipant, hasIdentity } from "@/lib/registration-form";
import { hit, getClientIp, tooManyRequests } from "@/lib/rate-limit";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  // Generous enough for a family sharing a connection or a lab full of students
  // on one NAT, tight enough to stop a script filling the participant list.
  const limited = hit(`register:${getClientIp(request)}`, 15, 10 * 60 * 1000);
  if (!limited.ok) return tooManyRequests(limited.retryAfterSeconds);

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

  // Reconstruct the {name,email,phone,department,year} participant record(s)
  // from the answers to the identity-tagged form fields.
  const { identityFields } = splitFields(event.registrationForm.fields);
  const individual =
    data.registrationType === "individual" ? deriveParticipant(identityFields, data.identity) : null;
  const team =
    data.registrationType === "team"
      ? {
          teamName: data.team.teamName,
          leader: deriveParticipant(identityFields, data.team.leader),
          members: data.team.members.map((m: Record<string, unknown>) =>
            deriveParticipant(identityFields, m)
          ),
        }
      : null;

  const responsible = team ? team.leader : individual!;
  const eligibility = checkEligibility(event, responsible);
  if (!eligibility.eligible) {
    return NextResponse.json({ error: eligibility.reason }, { status: 403 });
  }

  const { registrations } = await getCollections();

  // Duplicate detection keys on email — only possible when the form still
  // collects one.
  if (hasIdentity(event.registrationForm.fields, "email") && responsible.email) {
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
    individual,
    team,
    submittedAt: now,
    updatedAt: now,
    updatedBy: null,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
