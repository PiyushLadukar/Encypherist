import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-guard";
import { store } from "@/lib/store";
import { projectSchema } from "@/lib/validation/project";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  const index = store.projects.findIndex((p) => p.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid project data.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (store.projects.some((p) => p.slug === parsed.data.slug && p.id !== id)) {
    return NextResponse.json({ error: "A project with this slug already exists." }, { status: 409 });
  }

  const d = parsed.data;
  store.projects[index] = {
    ...store.projects[index],
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
    updated_at: new Date().toISOString(),
  };

  return NextResponse.json({ project: store.projects[index] });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  const index = store.projects.findIndex((p) => p.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  store.projects.splice(index, 1);

  return NextResponse.json({ success: true });
}
