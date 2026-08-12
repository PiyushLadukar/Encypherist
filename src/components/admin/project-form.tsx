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
import { projectSchema, type ProjectInput } from "@/lib/validation/project";
import type { Project } from "@/types/database";

const STATUSES = ["active", "in_development", "deployed", "archived"] as const;
const CONFIDENCE = ["verified", "likely", "unverified"] as const;

function toDefaults(project?: Project | null): ProjectInput {
  return {
    slug: project?.slug ?? "",
    name: project?.name ?? "",
    status: project?.status ?? "in_development",
    summary: project?.summary ?? "",
    problem: project?.problem ?? "",
    solution: project?.solution ?? "",
    tech_stack: project?.tech_stack ?? [],
    contributors: project?.contributors ?? [],
    link_url: project?.link_url ?? "",
    repo_url: project?.repo_url ?? "",
    image_url: project?.image_url ?? "",
    published: project?.published ?? true,
    sort_order: project?.sort_order ?? 0,
    confidence: project?.confidence ?? "verified",
  };
}

export function ProjectForm({ project }: { project?: Project | null }) {
  const router = useRouter();
  const isEdit = Boolean(project);
  const [values, setValues] = useState<ProjectInput>(toDefaults(project));
  const [techInput, setTechInput] = useState(values.tech_stack.join(", "));
  const [contributorsInput, setContributorsInput] = useState(values.contributors.join(", "));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = projectSchema.safeParse({
      ...values,
      tech_stack: techInput.split(",").map((s) => s.trim()).filter(Boolean),
      contributors: contributorsInput.split(",").map((s) => s.trim()).filter(Boolean),
    });
    if (!parsed.success) {
      setError(Object.values(parsed.error.flatten().fieldErrors)[0]?.[0] ?? "Please check the form.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(isEdit ? `/api/admin/projects/${project!.id}` : "/api/admin/projects", {
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

      toast.success(isEdit ? "Project updated." : "Project created.");
      router.push("/admin/projects");
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

      <div>
        <Label htmlFor="summary">Summary</Label>
        <Textarea id="summary" value={values.summary ?? ""} onChange={(e) => update("summary", e.target.value)} className="mt-1.5" rows={2} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Status</Label>
          <Select value={values.status} onValueChange={(v) => update("status", v as ProjectInput["status"])}>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Confidence</Label>
          <Select value={values.confidence} onValueChange={(v) => update("confidence", v as ProjectInput["confidence"])}>
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
        <Label htmlFor="problem">Problem</Label>
        <Textarea id="problem" value={values.problem ?? ""} onChange={(e) => update("problem", e.target.value)} className="mt-1.5" rows={3} />
      </div>
      <div>
        <Label htmlFor="solution">Solution</Label>
        <Textarea id="solution" value={values.solution ?? ""} onChange={(e) => update("solution", e.target.value)} className="mt-1.5" rows={3} />
      </div>

      <div>
        <Label htmlFor="tech_stack">Tech stack (comma separated)</Label>
        <Input id="tech_stack" value={techInput} onChange={(e) => setTechInput(e.target.value)} className="mt-1.5" placeholder="Next.js, Supabase, TypeScript" />
      </div>
      <div>
        <Label htmlFor="contributors">Contributors (comma separated)</Label>
        <Input id="contributors" value={contributorsInput} onChange={(e) => setContributorsInput(e.target.value)} className="mt-1.5" />
      </div>

      <ImageUploadField
        label="Cover image"
        bucket="forum-assets"
        value={values.image_url ?? ""}
        onChange={(url) => update("image_url", url)}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="link_url">Live URL</Label>
          <Input id="link_url" value={values.link_url ?? ""} onChange={(e) => update("link_url", e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="repo_url">Repo URL</Label>
          <Input id="repo_url" value={values.repo_url ?? ""} onChange={(e) => update("repo_url", e.target.value)} className="mt-1.5" />
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

      <div className="flex items-center gap-3">
        <Switch checked={values.published} onCheckedChange={(v) => update("published", v)} />
        <Label>Published</Label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={saving} className="font-mono text-sm">
        {saving ? <Loader2 className="size-4 animate-spin" /> : null}
        {isEdit ? "Save changes" : "Create project"}
      </Button>
    </form>
  );
}
