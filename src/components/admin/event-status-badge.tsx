import { Badge } from "@/components/ui/badge";
import { deriveEventStatus, eventStatusLabel } from "@/lib/event-status";
import type { Event, EventDisplayStatus } from "@/types/models";

const VARIANT_BY_STATUS: Record<EventDisplayStatus, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "outline",
  upcoming: "secondary",
  registration_open: "default",
  registration_closed: "outline",
  ongoing: "default",
  completed: "secondary",
  archived: "outline",
};

export function EventStatusBadge({ event }: { event: Event }) {
  const status = deriveEventStatus(event);
  return <Badge variant={VARIANT_BY_STATUS[status]}>{eventStatusLabel(status)}</Badge>;
}
