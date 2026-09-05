"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PosterUpload } from "./poster-upload";

export type BasicDetails = {
  name: string;
  slug: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  venue: string;
  coordinator: { name: string; email: string; phone: string };
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function BasicDetailsSection({
  value,
  onChange,
  slugManuallyEdited,
  onSlugManuallyEditedChange,
  eventId,
  posterUrl,
  onPosterUploaded,
}: {
  value: BasicDetails;
  onChange: (value: BasicDetails) => void;
  slugManuallyEdited: boolean;
  onSlugManuallyEditedChange: (edited: boolean) => void;
  eventId: string | null;
  posterUrl: string | null;
  onPosterUploaded: (url: string) => void;
}) {
  function set<K extends keyof BasicDetails>(key: K, v: BasicDetails[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Event details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Event name</Label>
            <Input
              id="name"
              value={value.name}
              onChange={(e) => {
                const name = e.target.value;
                onChange({ ...value, name, slug: slugManuallyEdited ? value.slug : slugify(name) });
              }}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="slug">URL slug</Label>
            <Input
              id="slug"
              value={value.slug}
              onChange={(e) => {
                onSlugManuallyEditedChange(true);
                set("slug", slugify(e.target.value));
              }}
              className="mt-1.5 font-mono text-sm"
            />
            <p className="mt-1 text-xs text-muted-foreground">/events/{value.slug || "your-event-slug"}</p>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={value.description}
              onChange={(e) => set("description", e.target.value)}
              className="mt-1.5 min-h-32"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="start_date">Start date</Label>
              <Input
                id="start_date"
                type="date"
                value={value.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="start_time">Start time</Label>
              <Input
                id="start_time"
                type="time"
                value={value.startTime}
                onChange={(e) => set("startTime", e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="end_date">End date (optional)</Label>
              <Input
                id="end_date"
                type="date"
                value={value.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="end_time">End time (optional)</Label>
              <Input
                id="end_time"
                type="time"
                value={value.endTime}
                onChange={(e) => set("endTime", e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="venue">Venue</Label>
            <Input id="venue" value={value.venue} onChange={(e) => set("venue", e.target.value)} className="mt-1.5" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coordinator</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="coordinator_name">Name</Label>
            <Input
              id="coordinator_name"
              value={value.coordinator.name}
              onChange={(e) => set("coordinator", { ...value.coordinator, name: e.target.value })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="coordinator_email">Email</Label>
            <Input
              id="coordinator_email"
              type="email"
              value={value.coordinator.email}
              onChange={(e) => set("coordinator", { ...value.coordinator, email: e.target.value })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="coordinator_phone">Phone</Label>
            <Input
              id="coordinator_phone"
              value={value.coordinator.phone}
              onChange={(e) => set("coordinator", { ...value.coordinator, phone: e.target.value })}
              className="mt-1.5"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Poster / banner</CardTitle>
        </CardHeader>
        <CardContent>
          <PosterUpload eventId={eventId} currentUrl={posterUrl} onUploaded={onPosterUploaded} />
        </CardContent>
      </Card>
    </div>
  );
}
