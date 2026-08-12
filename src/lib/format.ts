const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

const dateRangeMonthFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  timeZone: "Asia/Kolkata",
});

export function formatDate(iso: string | null): string {
  if (!iso) return "Date to be announced";
  return dateFormatter.format(new Date(iso));
}

/** "18–21 Sep 2024" style range when start/end fall in the same month, else "18 Sep – 4 Oct 2024". */
export function formatDateRange(startIso: string | null, endIso: string | null): string {
  if (!startIso) return "Date to be announced";
  if (!endIso || startIso.slice(0, 10) === endIso.slice(0, 10)) {
    return formatDate(startIso);
  }
  const start = new Date(startIso);
  const end = new Date(endIso);
  const sameMonth =
    start.getUTCFullYear() === end.getUTCFullYear() && start.getUTCMonth() === end.getUTCMonth();
  if (sameMonth) {
    return `${dateRangeMonthFormatter.format(start)}–${formatDate(endIso)}`;
  }
  return `${formatDate(startIso)} – ${formatDate(endIso)}`;
}

export function isPast(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

const eventTypeLabels: Record<string, string> = {
  hackathon: "Hackathon",
  workshop: "Workshop",
  talk: "Talk",
  competition: "Competition",
  seminar: "Seminar",
  donation_drive: "Donation Drive",
  other: "Activity",
};

export function eventTypeLabel(type: string): string {
  return eventTypeLabels[type] ?? "Activity";
}

const teamGroupLabels: Record<string, string> = {
  final: "Final Year",
  third: "Third Year",
  second: "Second Year",
  history: "Forum History",
};

export function teamGroupLabel(group: string): string {
  return teamGroupLabels[group] ?? group;
}

const projectStatusLabels: Record<string, string> = {
  active: "ACTIVE",
  in_development: "IN_DEVELOPMENT",
  deployed: "DEPLOYED",
  archived: "ARCHIVED",
};

export function projectStatusLabel(status: string): string {
  return projectStatusLabels[status] ?? status.toUpperCase();
}

export function projectNumber(index: number): string {
  return `PROJECT_${String(index + 1).padStart(3, "0")}`;
}

export function eventNumber(index: number): string {
  return `EVENT_${String(index + 1).padStart(3, "0")}`;
}

const DOMAIN_RULES: [RegExp, string][] = [
  [/technical|tech|cloud|resource/i, "TECHNICAL"],
  [/documentation/i, "DOCUMENTATION"],
  [/creative|content|visual|design|editor/i, "CREATIVE"],
  [/strategic|strategy/i, "STRATEGY"],
  [/publicity|promotion|social media|public relation/i, "OUTREACH"],
  [/photography|videography/i, "MEDIA"],
  [/president|secretary|treasurer|advisor|officer|manager|welfare|alumni/i, "LEADERSHIP"],
];

/** Derives a broad functional domain label from a member's real designation — never invented, just categorized. */
export function memberDomain(designation: string): string {
  for (const [pattern, label] of DOMAIN_RULES) {
    if (pattern.test(designation)) return label;
  }
  return "GENERAL";
}

export function memberStatus(teamGroup: string): "ACTIVE" | "ARCHIVED" {
  return teamGroup === "history" ? "ARCHIVED" : "ACTIVE";
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
