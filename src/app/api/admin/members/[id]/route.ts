import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-guard";
import { store } from "@/lib/store";
import { memberSchema } from "@/lib/validation/member";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  const index = store.members.findIndex((m) => m.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Member not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = memberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid member data.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (store.members.some((m) => m.slug === parsed.data.slug && m.id !== id)) {
    return NextResponse.json({ error: "A member with this slug already exists." }, { status: 409 });
  }

  const d = parsed.data;
  store.members[index] = {
    ...store.members[index],
    slug: d.slug,
    name: d.name,
    designation: d.designation,
    team_group: d.team_group,
    year_session: d.year_session,
    skills: d.skills,
    socials: d.socials,
    is_core: d.is_core,
    sort_order: d.sort_order,
    published: d.published,
    confidence: d.confidence,
    bio: d.bio || null,
    photo_url: d.photo_url || null,
    updated_at: new Date().toISOString(),
  };

  return NextResponse.json({ member: store.members[index] });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  const index = store.members.findIndex((m) => m.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Member not found." }, { status: 404 });
  }

  store.members.splice(index, 1);

  return NextResponse.json({ success: true });
}
