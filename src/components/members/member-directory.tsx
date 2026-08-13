"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MemberCard } from "@/components/members/member-card";
import { Stagger, StaggerItem } from "@/components/site/reveal";
import { teamGroupLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Member, TeamGroup } from "@/types/database";

const FILTERS: { value: TeamGroup | "all" | "core"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "core", label: "Core Team" },
  { value: "final", label: "Final Year" },
  { value: "third", label: "Third Year" },
  { value: "second", label: "Second Year" },
];

export function MemberDirectory({ members }: { members: Member[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["value"]>("all");
  const [query, setQuery] = useState("");

  const availableFilters = useMemo(() => {
    const present = new Set(members.map((m) => m.team_group));
    return FILTERS.filter(
      (f) =>
        f.value === "all" ||
        (f.value === "core" && members.some((m) => m.is_core)) ||
        present.has(f.value as TeamGroup)
    );
  }, [members]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      const matchesFilter =
        filter === "all" ? true : filter === "core" ? m.is_core : m.team_group === filter;
      const matchesQuery =
        q.length === 0 ||
        m.name.toLowerCase().includes(q) ||
        m.designation.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [members, filter, query]);

  const grouped = useMemo(() => {
    const map = new Map<TeamGroup, Member[]>();
    for (const member of filtered) {
      if (!map.has(member.team_group)) map.set(member.team_group, []);
      map.get(member.team_group)!.push(member);
    }
    return map;
  }, [filtered]);

  const groupOrder: TeamGroup[] = ["final", "third", "second"];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {availableFilters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-md border px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-all duration-300 bg-background",
                filter === f.value
                  ? "border-emerald-400 text-emerald-400 shadow-[0_0_12px_-2px_rgba(52,211,153,0.3)] font-semibold"
                  : "border-border/60 text-muted-foreground hover:border-zinc-700 hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members..."
            className="pl-9"
            aria-label="Search members"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-sm text-muted-foreground">
          No members match your search.
        </p>
      ) : (
        <div className="mt-12 space-y-14">
          {groupOrder
            .filter((g) => grouped.has(g))
            .map((group) => (
              <div key={group}>
                <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                  {teamGroupLabel(group)}
                </h2>
                <Stagger
                  key={`${group}-${filter}-${query}`}
                  className="mt-5 grid gap-5 items-start sm:grid-cols-2 lg:grid-cols-3"
                >
                  {grouped.get(group)!.map((member) => (
                    <StaggerItem key={member.id}>
                      <MemberCard member={member} />
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
