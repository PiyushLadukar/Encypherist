import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-guard";
import { store } from "@/lib/store";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  const index = store.eventGallery.findIndex((g) => g.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  store.eventGallery.splice(index, 1);

  return NextResponse.json({ success: true });
}
