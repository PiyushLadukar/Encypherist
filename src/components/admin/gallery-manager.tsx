"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Event } from "@/types/database";
import type { GalleryItemWithEvent } from "@/lib/data/admin";

export function GalleryManager({ events, items }: { events: Event[]; items: GalleryItemWithEvent[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!eventId) {
      setError("Select an event first.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("bucket", "event-gallery");
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: form });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setError(uploadData.error ?? "Upload failed.");
        return;
      }

      const createRes = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, image_url: uploadData.url, caption }),
      });
      if (!createRes.ok) {
        const data = await createRes.json();
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setCaption("");
      toast.success("Image uploaded.");
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Image removed.");
        router.refresh();
      } else {
        toast.error("Couldn't remove that image.");
      }
    } catch {
      toast.error("Network error — couldn't remove that image.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-5">
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Event</label>
          <Select value={eventId} onValueChange={(v) => setEventId(v ?? "")}>
            <SelectTrigger className="mt-1.5 w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Caption (optional)
          </label>
          <Input value={caption} onChange={(e) => setCaption(e.target.value)} className="mt-1.5 w-56" />
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        <Button type="button" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Upload image
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      {items.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">No gallery images yet.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-lg border border-border">
              <div className="relative aspect-square bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image_url} alt={item.caption ?? ""} className="size-full object-cover" />
              </div>
              <div className="flex items-center justify-between gap-2 p-2.5">
                <div className="min-w-0">
                  <p className="truncate font-mono text-[11px] text-muted-foreground">{item.event_title}</p>
                  {item.caption && <p className="truncate text-xs text-foreground">{item.caption}</p>}
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete image"
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                >
                  {deletingId === item.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
