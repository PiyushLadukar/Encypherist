import { NextResponse } from "next/server";
import { getEventBySlugAdmin } from "@/lib/data/admin-events";
import { isRegistrationOpen } from "@/lib/event-status";
import { saveUploadedImage, UploadError } from "@/lib/uploads";

/**
 * Public endpoint used by dynamic "file" fields during registration (e.g. an
 * "Upload Photograph" field) — uploads happen before the form is submitted,
 * and the resulting path is included as that field's response value. Same
 * validation as admin poster uploads: extension + MIME + magic-byte content
 * + size cap, never trusting the browser-supplied name/type.
 */
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlugAdmin(slug);
  if (!event || event.status !== "published") {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }
  if (!isRegistrationOpen(event).open) {
    return NextResponse.json({ error: "Registration isn't open for this event." }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
  }

  try {
    const url = await saveUploadedImage(file, `registrations/${event.id}`);
    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("registration upload failed", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
