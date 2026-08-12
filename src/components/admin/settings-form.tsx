"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { SiteSettings, SocialLink } from "@/types/database";

export function SettingsForm({
  settings,
  socialLinks,
}: {
  settings: SiteSettings;
  socialLinks: SocialLink[];
}) {
  const [name, setName] = useState(settings.name);
  const [tagline, setTagline] = useState(settings.tagline ?? "");
  const [description, setDescription] = useState(settings.description ?? "");
  const [contactEmail, setContactEmail] = useState(settings.contact_email ?? "");
  const [links, setLinks] = useState(
    socialLinks.map((l) => ({ platform: l.platform, url: l.url, visible: l.visible, sort_order: l.sort_order }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateLink(index: number, patch: Partial<(typeof links)[number]>) {
    setLinks((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: { name, tagline, description, contact_email: contactEmail },
          socialLinks: links,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        toast.error(data.error ?? "Something went wrong.");
        return;
      }
      toast.success("Settings saved.");
    } catch {
      setError("Network error — check your connection and try again.");
      toast.error("Network error — check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-10">
      <section className="space-y-4">
        <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Site information
        </h2>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" required />
        </div>
        <div>
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5"
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="contact_email">Contact email</Label>
          <Input
            id="contact_email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="mt-1.5"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Social links
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setLinks((prev) => [...prev, { platform: "", url: "", visible: true, sort_order: prev.length }])
            }
          >
            <Plus className="size-3.5" />
            Add link
          </Button>
        </div>
        <div className="space-y-3">
          {links.map((link, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 rounded-md border border-border p-3">
              <Input
                placeholder="platform (e.g. instagram)"
                value={link.platform}
                onChange={(e) => updateLink(i, { platform: e.target.value })}
                className="w-40"
              />
              <Input
                placeholder="https://..."
                value={link.url}
                onChange={(e) => updateLink(i, { url: e.target.value })}
                className="min-w-0 flex-1"
              />
              <div className="flex items-center gap-2">
                <Switch checked={link.visible} onCheckedChange={(v) => updateLink(i, { visible: v })} />
                <Label className="text-xs">Visible</Label>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove link"
                onClick={() => setLinks((prev) => prev.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={saving} className="font-mono text-sm">
        {saving ? <Loader2 className="size-4 animate-spin" /> : null}
        Save settings
      </Button>
    </form>
  );
}
