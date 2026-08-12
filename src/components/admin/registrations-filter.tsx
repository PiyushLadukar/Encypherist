"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Download } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Event } from "@/types/database";

export function RegistrationsFilter({ events }: { events: Event[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("event") ?? "all";

  function onChange(value: string | null) {
    if (value === null) return;
    const params = new URLSearchParams(searchParams);
    if (value === "all") params.delete("event");
    else params.set("event", value);
    router.push(`/admin/registrations?${params.toString()}`);
  }

  const exportHref = `/api/admin/registrations/export${current !== "all" ? `?event_id=${current}` : ""}`;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={current} onValueChange={onChange}>
        <SelectTrigger className="w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All events</SelectItem>
          {events.map((event) => (
            <SelectItem key={event.id} value={event.id}>
              {event.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm" nativeButton={false} render={<a href={exportHref} />}>
        <Download className="size-3.5" />
        Export CSV
      </Button>
    </div>
  );
}
