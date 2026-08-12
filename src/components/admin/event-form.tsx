"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { eventSchema, type EventInput } from "@/lib/validation/event";
import type { Event } from "@/types/database";

const EVENT_TYPES = ["hackathon", "workshop", "talk", "competition", "seminar", "donation_drive", "other"] as const;
const STATUSES = ["draft", "published", "archived"] as const;
const CONFIDENCE = ["verified", "likely", "unverified"] as const;

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * The form's local state always keeps these as plain strings (never null) —
 * only the wire-level EventInput allows null, to accept round-tripped API
 * data. toDefaults() below is what bridges the two.
 */
type FormValues = Omit<
  EventInput,
  "start_at" | "end_at" | "location" | "poster_url" | "registration_deadline" | "eligibility" | "rules"
> & {
  start_at: string;
  end_at: string;
  location: string;
  poster_url: string;
  registration_deadline: string;
  eligibility: string;
  rules: string;
};

function toDefaults(event?: Event | null): FormValues {
  return {
    slug: event?.slug ?? "",
    title: event?.title ?? "",
    type: event?.type ?? "other",
    status: event?.status ?? "draft",
    summary: event?.summary ?? "",
    description: event?.description ?? "",
    start_at: toLocalInput(event?.start_at ?? null),
    end_at: toLocalInput(event?.end_at ?? null),
    location: event?.location ?? "",
    poster_url: event?.poster_url ?? "",
    registration_enabled: event?.registration_enabled ?? false,
    registration_deadline: toLocalInput(event?.registration_deadline ?? null),
    capacity: event?.capacity ?? null,
    eligibility: event?.eligibility ?? "",
    rules: event?.rules ?? "",
    schedule: event?.schedule ?? [],
    confidence: event?.confidence ?? "verified",
  };
}

export function EventForm({ event }: { event?: Event | null }) {
  const router = useRouter();
  const isEdit = Boolean(event);
  const [values, setValues] = useState<FormValues>(toDefaults(event));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function updateSchedule(index: number, patch: Partial<FormValues["schedule"][number]>) {
    setValues((prev) => ({
      ...prev,
      schedule: prev.schedule.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  async function handleSubmit(e: FormEvent, redirectAfter = true) {
    e.preventDefault();
    setError(null);

    const parsed = eventSchema.safeParse(values);
    if (!parsed.success) {
      setError(Object.values(parsed.error.flatten().fieldErrors)[0]?.[0] ?? "Please check the form.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...parsed.data,
        start_at: parsed.data.start_at ? new Date(parsed.data.start_at).toISOString() : null,
        end_at: parsed.data.end_at ? new Date(parsed.data.end_at).toISOString() : null,
        registration_deadline: parsed.data.registration_deadline
          ? new Date(parsed.data.registration_deadline).toISOString()
          : null,
      };

      const res = await fetch(isEdit ? `/api/admin/events/${event!.id}` : "/api/admin/events", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        toast.error(data.error ?? "Something went wrong.");
        setSaving(false);
        return;
      }

      toast.success(isEdit ? "Event updated." : "Event created.");

      if (redirectAfter) {
        router.push("/admin/events");
        router.refresh();
      } else {
        router.refresh();
        setSaving(false);
      }
    } catch {
      setError("Network error — check your connection and try again.");
      toast.error("Network error — check your connection and try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-10">
      <section className="space-y-4">
        <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Basic information
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={values.title}
              onChange={(e) => update("title", e.target.value)}
              className="mt-1.5"
              required
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={values.slug}
              onChange={(e) => update("slug", e.target.value)}
              className="mt-1.5 font-mono"
              placeholder="my-event-name"
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="summary">Summary</Label>
          <Textarea
            id="summary"
            value={values.summary}
            onChange={(e) => update("summary", e.target.value)}
            className="mt-1.5"
            rows={2}
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
            className="mt-1.5"
            rows={6}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Type</Label>
            <Select value={values.type} onValueChange={(v) => update("type", v as EventInput["type"])}>
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={values.status} onValueChange={(v) => update("status", v as EventInput["status"])}>
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Confidence</Label>
            <Select
              value={values.confidence}
              onValueChange={(v) => update("confidence", v as EventInput["confidence"])}
            >
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONFIDENCE.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Date &amp; location
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="start_at">Start</Label>
            <Input
              id="start_at"
              type="datetime-local"
              value={values.start_at}
              onChange={(e) => update("start_at", e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="end_at">End</Label>
            <Input
              id="end_at"
              type="datetime-local"
              value={values.end_at}
              onChange={(e) => update("end_at", e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={values.location}
            onChange={(e) => update("location", e.target.value)}
            className="mt-1.5"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Registration
        </h2>
        <div className="flex items-center gap-3">
          <Switch
            checked={values.registration_enabled}
            onCheckedChange={(v) => update("registration_enabled", v)}
          />
          <Label>Registration enabled</Label>
        </div>
        {values.registration_enabled && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="registration_deadline">Deadline</Label>
              <Input
                id="registration_deadline"
                type="datetime-local"
                value={values.registration_deadline}
                onChange={(e) => update("registration_deadline", e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                value={values.capacity ?? ""}
                onChange={(e) => update("capacity", e.target.value ? Number(e.target.value) : null)}
                className="mt-1.5"
              />
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Media</h2>
        <ImageUploadField
          label="Poster"
          bucket="event-posters"
          value={values.poster_url ?? ""}
          onChange={(url) => update("poster_url", url)}
        />
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Details</h2>
        <div>
          <Label htmlFor="eligibility">Eligibility</Label>
          <Textarea
            id="eligibility"
            value={values.eligibility}
            onChange={(e) => update("eligibility", e.target.value)}
            className="mt-1.5"
            rows={2}
          />
        </div>
        <div>
          <Label htmlFor="rules">Rules</Label>
          <Textarea
            id="rules"
            value={values.rules}
            onChange={(e) => update("rules", e.target.value)}
            className="mt-1.5"
            rows={4}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label>Schedule</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setValues((prev) => ({
                  ...prev,
                  schedule: [...prev.schedule, { time: "", title: "", description: "" }],
                }))
              }
            >
              <Plus className="size-3.5" />
              Add item
            </Button>
          </div>
          <div className="mt-3 space-y-3">
            {values.schedule.map((item, i) => (
              <div key={i} className="flex gap-2 rounded-md border border-border p-3">
                <div className="grid flex-1 gap-2 sm:grid-cols-[100px_1fr]">
                  <Input
                    placeholder="10:00 AM"
                    value={item.time ?? ""}
                    onChange={(e) => updateSchedule(i, { time: e.target.value })}
                  />
                  <Input
                    placeholder="Item title"
                    value={item.title}
                    onChange={(e) => updateSchedule(i, { title: e.target.value })}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setValues((prev) => ({
                      ...prev,
                      schedule: prev.schedule.filter((_, idx) => idx !== i),
                    }))
                  }
                  aria-label="Remove schedule item"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving} className="font-mono text-sm">
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          {isEdit ? "Save changes" : "Create event"}
        </Button>
        {isEdit && (
          <Button
            variant="outline"
            className="font-mono text-sm"
            nativeButton={false}
            render={<a href={`/admin/events/${event!.id}/preview`} target="_blank" rel="noopener noreferrer" />}
          >
            <Eye className="size-4" />
            Preview
          </Button>
        )}
      </div>
    </form>
  );
}
