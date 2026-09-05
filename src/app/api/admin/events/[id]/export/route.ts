import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { requireAdminApi, AdminAuthError } from "@/lib/admin-guard";
import { getEventById } from "@/lib/data/admin-events";
import { listAllRegistrationsForExport } from "@/lib/data/registrations";
import { buildExportRows, toCsv } from "@/lib/export";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminApi();
  } catch (err) {
    const status = err instanceof AdminAuthError ? err.status : 401;
    return NextResponse.json({ error: "Not authorized." }, { status });
  }

  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const format = new URL(request.url).searchParams.get("format") === "xlsx" ? "xlsx" : "csv";
  const registrations = await listAllRegistrationsForExport(id);
  const { headers, rows } = buildExportRows(event, registrations);
  const fileBase = event.slug || "event";

  if (format === "csv") {
    const csv = toCsv(headers, rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileBase}-registrations.csv"`,
      },
    });
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Registrations");
  sheet.columns = headers.map((h) => ({ header: h, key: h, width: Math.min(Math.max(h.length + 4, 14), 40) }));
  sheet.getRow(1).font = { bold: true };
  for (const row of rows) sheet.addRow(row);

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(Buffer.from(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileBase}-registrations.xlsx"`,
    },
  });
}
