import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { requireAdminApi } from "@/lib/admin-guard";

const ALLOWED_BUCKETS = ["forum-assets", "member-images", "event-posters", "event-gallery"] as const;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Writes to public/uploads/<bucket>/ on local disk — a stand-in for
 * Supabase Storage while the site runs on fake data (see src/lib/store.ts).
 * Works for local dev and `next start` on a persistent filesystem; won't
 * persist on ephemeral/serverless deploys. Swap for real Storage uploads
 * alongside the rest of the Supabase wiring (see README).
 */
export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid form data." }, { status: 400 });

  const file = form.get("file");
  const bucket = form.get("bucket");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (typeof bucket !== "string" || !ALLOWED_BUCKETS.includes(bucket as (typeof ALLOWED_BUCKETS)[number])) {
    return NextResponse.json({ error: "Invalid upload target." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG and WebP images are allowed." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File must be 5MB or smaller." }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", bucket);
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${bucket}/${filename}` }, { status: 201 });
}
