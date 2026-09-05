import "server-only";
import type { Event, Registration, FormField } from "@/types/models";

export type ExportRow = Record<string, string>;

function formatResponseValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join("; ");
  return String(value);
}

/**
 * Defuses CSV/Excel formula injection: a cell starting with =, +, -, @, or a
 * tab/CR character is interpreted as a formula by Excel/Sheets when opened,
 * so a participant submitting e.g. `=cmd|'/c calc'!A1` as their name could
 * execute code on whoever opens the export. Prefixing with a single quote
 * forces spreadsheet apps to treat the cell as plain text.
 */
function neutralizeFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function cell(value: string): string {
  return neutralizeFormula(value);
}

/**
 * Builds one export row per registration (teams collapse to one row led by
 * the team leader, with a "Team Members" column listing the rest) plus a
 * column per custom field that appears in ANY registration's form snapshot
 * for this event — so the export stays correct even across form versions.
 */
export function buildExportRows(event: Event, registrations: Registration[]): { headers: string[]; rows: ExportRow[] } {
  const customFieldsByKey = new Map<string, FormField>();
  for (const reg of registrations) {
    for (const field of reg.formSnapshot) {
      if (!customFieldsByKey.has(field.key)) customFieldsByKey.set(field.key, field);
    }
  }
  const customFields = Array.from(customFieldsByKey.values()).sort((a, b) => a.order - b.order);

  const baseHeaders = [
    "Name",
    "Email",
    "Phone",
    "Department",
    "Year",
    "Team Name",
    "Team Members",
    "Registration Type",
    "Registration Date",
    "Status",
  ];
  const headers = [...baseHeaders, ...customFields.map((f) => f.label)];

  const rows: ExportRow[] = registrations.map((reg) => {
    const person = reg.registrationType === "team" ? reg.team!.leader : reg.individual!;
    const row: ExportRow = {
      Name: cell(person.name),
      Email: cell(person.email),
      Phone: cell(person.phone),
      Department: cell(person.department),
      Year: cell(person.year),
      "Team Name": cell(reg.registrationType === "team" ? reg.team!.teamName : ""),
      "Team Members": cell(
        reg.registrationType === "team"
          ? reg.team!.members.map((m) => `${m.name} <${m.email}>`).join("; ")
          : ""
      ),
      "Registration Type": reg.registrationType === "team" ? "Team" : "Individual",
      "Registration Date": new Date(reg.submittedAt).toLocaleString("en-IN"),
      Status: reg.status[0].toUpperCase() + reg.status.slice(1),
    };
    for (const field of customFields) {
      row[field.label] = cell(formatResponseValue(reg.responses[field.key]));
    }
    return row;
  });

  return { headers, rows };
}

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsv(headers: string[], rows: ExportRow[]): string {
  const lines = [headers.map(escapeCsvField).join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsvField(row[h] ?? "")).join(","));
  }
  // BOM so Excel opens UTF-8 (names with non-ASCII characters) correctly.
  return `﻿${lines.join("\r\n")}`;
}
