"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState, Suspense } from "react";
import { EventCard } from "@/components/events/event-card";
import { EventTimeline } from "@/components/events/event-timeline";
import { Stagger, StaggerItem } from "@/components/site/reveal";
import { eventTypeLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Event, EventType } from "@/types/database";

type Tab = "upcoming" | "past" | "announced";

function EventDirectoryContent({
  upcoming,
  past,
  announced,
}: {
  upcoming: Event[];
  past: Event[];
  announced: Event[];
}) {
  const searchParams = useSearchParams();
  const paramTab = searchParams.get("tab") as Tab | null;

  const initialTab: Tab = (paramTab && ["upcoming", "past", "announced"].includes(paramTab))
    ? paramTab
    : upcoming.length > 0 ? "upcoming" : announced.length > 0 ? "announced" : "past";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");

  // Re-syncs `tab` when the `?tab=` param changes under an already-mounted
  // instance (e.g. a Link elsewhere on the site pointing at `?tab=announced`)
  // — adjusted directly during render rather than in an effect, since
  // setState-in-effect for a prop-driven value costs an extra render pass
  // for no benefit; this is React's own recommended pattern for it.
  const [prevParamTab, setPrevParamTab] = useState(paramTab);
  if (paramTab !== prevParamTab) {
    setPrevParamTab(paramTab);
    if (paramTab && ["upcoming", "past", "announced"].includes(paramTab)) {
      setTab(paramTab);
    }
  }

  const allTabs: { value: Tab; label: string; count: number }[] = [
    { value: "upcoming", label: "Upcoming", count: upcoming.length },
    { value: "announced", label: "Announced", count: announced.length },
    { value: "past", label: "Past", count: past.length },
  ];
  const tabs = allTabs.filter((t) => t.count > 0);

  const activeList = tab === "upcoming" ? upcoming : tab === "past" ? past : announced;

  const availableTypes = useMemo(() => {
    const set = new Set(activeList.map((e) => e.type));
    return Array.from(set);
  }, [activeList]);

  const filtered = useMemo(
    () => (typeFilter === "all" ? activeList : activeList.filter((e) => e.type === typeFilter)),
    [activeList, typeFilter]
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-6">
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => {
              setTab(t.value);
              setTypeFilter("all");
            }}
            className={cn(
              "rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors",
              tab === t.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {availableTypes.length > 1 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setTypeFilter("all")}
            className={cn(
              "rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors",
              typeFilter === "all"
                ? "text-primary"
                : "text-muted-foreground/60 hover:text-muted-foreground"
            )}
          >
            All
          </button>
          {availableTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={cn(
                "rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors",
                typeFilter === type
                  ? "text-primary"
                  : "text-muted-foreground/60 hover:text-muted-foreground"
              )}
            >
              {eventTypeLabel(type)}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-sm text-muted-foreground">No events to show.</p>
      ) : tab === "past" ? (
        <Stagger key={`${tab}-${typeFilter}`} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <StaggerItem key={event.id} className="h-full">
              <EventCard event={event} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <div className="mt-10">
          <EventTimeline key={`${tab}-${typeFilter}`} events={filtered} />
        </div>
      )}
    </div>
  );
}

export function EventDirectory(props: {
  upcoming: Event[];
  past: Event[];
  announced: Event[];
}) {
  return (
    <Suspense fallback={null}>
      <EventDirectoryContent {...props} />
    </Suspense>
  );
}
