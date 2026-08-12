"use client";

import { useEffect, useState } from "react";

function getParts(target: number) {
  const diff = Math.max(0, target - Date.now());
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { days, hours, minutes, seconds, done: diff === 0 };
}

/** A live countdown to an event's start time — part of the "event command center" detail page. */
export function Countdown({ target }: { target: string }) {
  const targetMs = new Date(target).getTime();
  const [parts, setParts] = useState(() => getParts(targetMs));

  useEffect(() => {
    const interval = setInterval(() => setParts(getParts(targetMs)), 1000);
    return () => clearInterval(interval);
  }, [targetMs]);

  if (parts.done) return null;

  const units: [string, number][] = [
    ["DAYS", parts.days],
    ["HRS", parts.hours],
    ["MIN", parts.minutes],
    ["SEC", parts.seconds],
  ];

  return (
    <div className="flex gap-4 font-mono">
      {units.map(([label, value]) => (
        <div key={label} className="text-center">
          <p className="font-tabular text-2xl font-semibold text-primary sm:text-3xl">
            {String(value).padStart(2, "0")}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
