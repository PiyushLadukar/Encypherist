import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-guard";
import { store } from "@/lib/store";

function csvEscape(value: unknown): string {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function GET(request: Request) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const eventId = new URL(request.url).searchParams.get("event_id");
  const rows = (eventId
    ? store.eventRegistrations.filter((r) => r.event_id === eventId)
    : store.eventRegistrations
  )
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const header = ["Event", "Full Name", "Email", "Phone", "College", "Branch", "Year", "Registered At"];
  const body = rows.map((r) => {
    const event = store.events.find((e) => e.id === r.event_id);
    return [
      event?.title ?? "",
      r.full_name,
      r.email,
      r.phone,
      r.college,
      r.branch ?? "",
      r.year ?? "",
      r.created_at,
    ];
  });

  const csv = [header, ...body].map((row) => row.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="registrations${eventId ? `-${eventId}` : ""}.csv"`,
    },
  });
}
