import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireAdminApi } from "@/lib/admin-guard";
import { store } from "@/lib/store";
import { projectSchema } from "@/lib/validation/project";

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const body = await request.json().catch(() => null);
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid project data.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (store.projects.some((p) => p.slug === parsed.data.slug)) {
    return NextResponse.json({ error: "A project with this slug already exists." }, { status: 409 });
  }

  const now = new Date().toISOString();
  const d = parsed.data;

  const project = {
    id: randomUUID(),
    slug: d.slug,
    name: d.name,
    status: d.status,
    tech_stack: d.tech_stack,
    contributors: d.contributors,
    published: d.published,
    sort_order: d.sort_order,
    confidence: d.confidence,
    summary: d.summary || null,
    problem: d.problem || null,
    solution: d.solution || null,
    link_url: d.link_url || null,
    repo_url: d.repo_url || null,
    image_url: d.image_url || null,
    created_at: now,
    updated_at: now,
  };

  store.projects.push(project);

  return NextResponse.json({ project }, { status: 201 });
}
