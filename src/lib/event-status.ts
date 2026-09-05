import type { Event, EventDisplayStatus } from "@/types/models";

function combine(date: string | null, time: string | null): Date | null {
  if (!date) return null;
  const datePart = date.slice(0, 10);
  return new Date(`${datePart}T${time || "00:00"}:00`);
}

export function eventStartsAt(event: Pick<Event, "startDate" | "startTime">): Date | null {
  return combine(event.startDate, event.startTime);
}

export function eventEndsAt(event: Pick<Event, "startDate" | "endDate" | "startTime" | "endTime">): Date | null {
  return combine(event.endDate ?? event.startDate, event.endTime ?? event.startTime);
}

/**
 * Derives the display lifecycle from admin-controlled publication state plus
 * dates — draft/archived are explicit admin decisions; everything else
 * (upcoming/registration open/closed/ongoing/completed) is computed so
 * admins never have to remember to flip a status flag by hand.
 */
export function deriveEventStatus(event: Event, now: Date = new Date()): EventDisplayStatus {
  if (event.status === "draft") return "draft";
  if (event.status === "archived") return "archived";

  const start = eventStartsAt(event);
  const end = eventEndsAt(event);

  if (start && now.getTime() >= start.getTime() && (!end || now.getTime() <= end.getTime())) {
    return "ongoing";
  }
  if (end && now.getTime() > end.getTime()) return "completed";

  // Upcoming (or date-to-be-announced): registration sub-state matters most.
  if (event.registrationEnabled) {
    const deadline = event.registrationDeadline ? new Date(event.registrationDeadline) : null;
    if (deadline && now.getTime() > deadline.getTime()) return "registration_closed";
    return "registration_open";
  }
  return "upcoming";
}

const STATUS_LABELS: Record<EventDisplayStatus, string> = {
  draft: "Draft",
  upcoming: "Upcoming",
  registration_open: "Registration Open",
  registration_closed: "Registration Closed",
  ongoing: "Ongoing",
  completed: "Completed",
  archived: "Archived",
};

export function eventStatusLabel(status: EventDisplayStatus): string {
  return STATUS_LABELS[status];
}

export function isRegistrationOpen(event: Event, now: Date = new Date()): { open: boolean; reason: string | null } {
  if (event.status !== "published") return { open: false, reason: "This event isn't published yet." };
  if (!event.registrationEnabled) return { open: false, reason: "Registration isn't open for this event." };
  if (event.registrationDeadline && now.getTime() > new Date(event.registrationDeadline).getTime()) {
    return { open: false, reason: "Registration has closed." };
  }
  return { open: true, reason: null };
}
