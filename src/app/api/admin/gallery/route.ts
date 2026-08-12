import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-guard";
import { store } from "@/lib/store";

const gallerySchema = z.object({
  event_id: z.string().min(1),
  image_url: z.string().url(),
  caption: z.string().trim().max(200).optional().or(z.literal("")),
  sort_order: z.coerce.number().int().default(0),
});

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const body = await request.json().catch(() => null);
  const parsed = gallerySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid gallery data." }, { status: 400 });
  }

  if (!store.events.some((e) => e.id === parsed.data.event_id)) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const item = {
    id: randomUUID(),
    ...parsed.data,
    caption: parsed.data.caption || null,
    created_at: new Date().toISOString(),
  };

  store.eventGallery.push(item);

  return NextResponse.json({ item }, { status: 201 });
}
