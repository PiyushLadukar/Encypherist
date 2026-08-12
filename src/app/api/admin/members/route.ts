import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireAdminApi } from "@/lib/admin-guard";
import { store } from "@/lib/store";
import { memberSchema } from "@/lib/validation/member";

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const body = await request.json().catch(() => null);
  const parsed = memberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid member data.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (store.members.some((m) => m.slug === parsed.data.slug)) {
    return NextResponse.json({ error: "A member with this slug already exists." }, { status: 409 });
  }

  const now = new Date().toISOString();
  const member = {
    id: randomUUID(),
    ...parsed.data,
    bio: parsed.data.bio || null,
    photo_url: parsed.data.photo_url || null,
    created_at: now,
    updated_at: now,
  };

  store.members.push(member);

  return NextResponse.json({ member }, { status: 201 });
}
