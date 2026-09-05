"use client";

import { useState, type KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Chip-based multi-select: click a suggestion to toggle it, or type a custom value and press Enter/comma. */
export function TagMultiSelect({
  value,
  onChange,
  suggestions = [],
  placeholder = "Add a value and press Enter",
}: {
  value: string[];
  onChange: (value: string[]) => void;
  suggestions?: readonly string[];
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function add(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    }
  }

  const unusedSuggestions = suggestions.filter((s) => !value.includes(s));

  return (
    <div className="space-y-2.5">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
            >
              {tag}
              <button type="button" onClick={() => onChange(value.filter((v) => v !== tag))} aria-label={`Remove ${tag}`}>
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="icon" onClick={() => add(draft)} disabled={!draft.trim()}>
          <Plus className="size-4" />
        </Button>
      </div>
      {unusedSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {unusedSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className={cn(
                "rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              )}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
