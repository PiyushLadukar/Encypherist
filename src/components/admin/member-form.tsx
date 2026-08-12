"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
import { memberSchema, type MemberInput } from "@/lib/validation/member";
import type { Member } from "@/types/database";

const TEAM_GROUPS = ["final", "third", "second", "history"] as const;
const CONFIDENCE = ["verified", "likely", "unverified"] as const;

function toDefaults(member?: Member | null): MemberInput {
  return {
    slug: member?.slug ?? "",
    name: member?.name ?? "",
    designation: member?.designation ?? "",
    team_group: member?.team_group ?? "second",
    year_session: member?.year_session ?? "",
    bio: member?.bio ?? "",
    skills: member?.skills ?? [],
    photo_url: member?.photo_url ?? "",
    socials: member?.socials ?? {},
    is_core: member?.is_core ?? false,
    sort_order: member?.sort_order ?? 0,
    published: member?.published ?? true,
    confidence: member?.confidence ?? "verified",
  };
}

export function MemberForm({ member }: { member?: Member | null }) {
  const router = useRouter();
  const isEdit = Boolean(member);
  const [values, setValues] = useState<MemberInput>(toDefaults(member));
  const [skillsInput, setSkillsInput] = useState(values.skills.join(", "));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof MemberInput>(key: K, value: MemberInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = memberSchema.safeParse({
      ...values,
      skills: skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    if (!parsed.success) {
      setError(Object.values(parsed.error.flatten().fieldErrors)[0]?.[0] ?? "Please check the form.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(isEdit ? `/api/admin/members/${member!.id}` : "/api/admin/members", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        toast.error(data.error ?? "Something went wrong.");
        setSaving(false);
        return;
      }

      toast.success(isEdit ? "Member updated." : "Member added.");
      router.push("/admin/members");
      router.refresh();
    } catch {
      setError("Network error — check your connection and try again.");
      toast.error("Network error — check your connection and try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={values.name} onChange={(e) => update("name", e.target.value)} className="mt-1.5" required />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={values.slug}
            onChange={(e) => update("slug", e.target.value)}
            className="mt-1.5 font-mono"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="designation">Designation</Label>
          <Input
            id="designation"
            value={values.designation}
            onChange={(e) => update("designation", e.target.value)}
            className="mt-1.5"
            required
          />
        </div>
        <div>
          <Label htmlFor="year_session">Year / session</Label>
          <Input
            id="year_session"
            value={values.year_session}
            onChange={(e) => update("year_session", e.target.value)}
            className="mt-1.5"
            placeholder="2026-27"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Team group</Label>
          <Select value={values.team_group} onValueChange={(v) => update("team_group", v as MemberInput["team_group"])}>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEAM_GROUPS.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Confidence</Label>
          <Select value={values.confidence} onValueChange={(v) => update("confidence", v as MemberInput["confidence"])}>
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

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" value={values.bio} onChange={(e) => update("bio", e.target.value)} className="mt-1.5" rows={4} />
      </div>

      <div>
        <Label htmlFor="skills">Skills (comma separated)</Label>
        <Input
          id="skills"
          value={skillsInput}
          onChange={(e) => setSkillsInput(e.target.value)}
          className="mt-1.5"
          placeholder="React, Figma, Python"
        />
      </div>

      <ImageUploadField
        label="Photo"
        bucket="member-images"
        value={values.photo_url ?? ""}
        onChange={(url) => update("photo_url", url)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="instagram">Instagram URL</Label>
          <Input
            id="instagram"
            value={values.socials.instagram ?? ""}
            onChange={(e) => update("socials", { ...values.socials, instagram: e.target.value })}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="linkedin">LinkedIn URL</Label>
          <Input
            id="linkedin"
            value={values.socials.linkedin ?? ""}
            onChange={(e) => update("socials", { ...values.socials, linkedin: e.target.value })}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="github">GitHub URL</Label>
          <Input
            id="github"
            value={values.socials.github ?? ""}
            onChange={(e) => update("socials", { ...values.socials, github: e.target.value })}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="sort_order">Sort order</Label>
          <Input
            id="sort_order"
            type="number"
            value={values.sort_order}
            onChange={(e) => update("sort_order", Number(e.target.value))}
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Switch checked={values.is_core} onCheckedChange={(v) => update("is_core", v)} />
          <Label>Core team</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={values.published} onCheckedChange={(v) => update("published", v)} />
          <Label>Published</Label>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={saving} className="font-mono text-sm">
        {saving ? <Loader2 className="size-4 animate-spin" /> : null}
        {isEdit ? "Save changes" : "Create member"}
      </Button>
    </form>
  );
}
