"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_OPTIONS = ["all", "pending", "approved", "rejected", "waitlisted"] as const;
const TYPE_OPTIONS = ["all", "individual", "team"] as const;

export function ParticipantFiltersBar({ departments, years }: { departments: string[]; years: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          defaultValue={searchParams.get("search") ?? ""}
          placeholder="Search name or email..."
          className="pl-8"
          onChange={(e) => setParam("search", e.target.value)}
        />
      </div>

      <Select value={searchParams.get("status") ?? "all"} onValueChange={(v) => setParam("status", v ?? "all")}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((s) => (
            <SelectItem key={s} value={s} className="capitalize">
              {s === "all" ? "All statuses" : s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={searchParams.get("type") ?? "all"} onValueChange={(v) => setParam("type", v ?? "all")}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TYPE_OPTIONS.map((t) => (
            <SelectItem key={t} value={t} className="capitalize">
              {t === "all" ? "All types" : t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {departments.length > 0 && (
        <Select value={searchParams.get("department") ?? "all"} onValueChange={(v) => setParam("department", v ?? "all")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {years.length > 0 && (
        <Select value={searchParams.get("year") ?? "all"} onValueChange={(v) => setParam("year", v ?? "all")}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
