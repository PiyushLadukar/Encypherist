import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { AdminAuthError, requireAdminApi } from "@/lib/admin-guard";
import { DEFAULT_ACADEMIC_YEARS } from "@/data/gallery";
import { galleryEventExists, insertGalleryEvent } from "@/lib/data/gallery-events";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getExt(file: File, fallback = ".jpg"): string {
  const ext = path.extname(file.name).toLowerCase();
  if (ext && [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].includes(ext)) {
    return ext;
  }
  return fallback;
}

/**
 * Creates a Gallery album: photographs land in public/gallery/<id>/ and the
 * album record goes to MongoDB.
 *
 * This used to append the album to src/data/gallery.ts. That only ever worked
 * under `next dev` — a production build serves compiled output and never
 * re-reads its source, so the album silently never appeared. The record lives
 * in the database now; see lib/data/gallery-events.ts.
 *
 * Note the photographs themselves still need a writable, persistent public/
 * directory. That holds on a normal server or VPS, but not on a serverless
 * host, where the filesystem is read-only and per-request.
 */
export async function POST(request: Request) {
  let createdDir: string | null = null;

  try {
    // The authorization boundary. Without this the endpoint accepted uploads
    // from anyone who could find it.
    await requireAdminApi();

    const formData = await request.formData();
    const title = formData.get("title")?.toString().trim();
    const description = formData.get("description")?.toString().trim() || "";
    const rawAcademicYear = formData.get("academicYear")?.toString().trim();
    const posterFile = formData.get("poster") as File | null;
    const photoFiles = formData.getAll("photos") as File[];

    if (!title) {
      return NextResponse.json({ error: "Event name is required." }, { status: 400 });
    }

    const eventId = slugify(title);
    if (!eventId) {
      return NextResponse.json({ error: "Invalid event title." }, { status: 400 });
    }

    if (await galleryEventExists(eventId)) {
      return NextResponse.json(
        { error: `An event with ID "${eventId}" already exists.` },
        { status: 400 }
      );
    }

    const galleryDir = path.join(process.cwd(), "public", "gallery", eventId);

    try {
      await fs.access(galleryDir);
      return NextResponse.json(
        { error: `Directory for event "${eventId}" already exists.` },
        { status: 400 }
      );
    } catch {
      // Directory does not exist, safe to proceed
    }

    if (!rawAcademicYear || !DEFAULT_ACADEMIC_YEARS.includes(rawAcademicYear)) {
      return NextResponse.json({ error: "Invalid academic year." }, { status: 400 });
    }
    const academicYear = rawAcademicYear;

    if (!posterFile || !(posterFile instanceof File) || posterFile.size === 0) {
      return NextResponse.json({ error: "Card poster image is required." }, { status: 400 });
    }

    if (posterFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Poster file size exceeds 10MB limit." }, { status: 400 });
    }

    if (
      posterFile.type &&
      !ALLOWED_MIME_TYPES.includes(posterFile.type.toLowerCase()) &&
      !posterFile.type.startsWith("image/")
    ) {
      return NextResponse.json({ error: "Poster file must be a valid image." }, { status: 400 });
    }

    if (!photoFiles || photoFiles.length === 0) {
      return NextResponse.json({ error: "At least one photograph is required." }, { status: 400 });
    }

    for (const photo of photoFiles) {
      if (!(photo instanceof File) || photo.size === 0) {
        return NextResponse.json({ error: "Invalid photo file uploaded." }, { status: 400 });
      }
      if (photo.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Photo "${photo.name}" exceeds 10MB size limit.` },
          { status: 400 }
        );
      }
      if (
        photo.type &&
        !ALLOWED_MIME_TYPES.includes(photo.type.toLowerCase()) &&
        !photo.type.startsWith("image/")
      ) {
        return NextResponse.json(
          { error: `Photo "${photo.name}" must be a valid image.` },
          { status: 400 }
        );
      }
    }

    await fs.mkdir(galleryDir, { recursive: true });
    createdDir = galleryDir;

    const posterExt = getExt(posterFile, ".jpg");
    const posterFileName = `poster${posterExt}`;
    const posterBuffer = Buffer.from(await posterFile.arrayBuffer());
    await fs.writeFile(path.join(galleryDir, posterFileName), posterBuffer);

    const photoPaths: string[] = [];
    for (let i = 0; i < photoFiles.length; i++) {
      const photoFile = photoFiles[i];
      const fileName = `photo-${i + 1}${getExt(photoFile, ".jpg")}`;
      const photoBuffer = Buffer.from(await photoFile.arrayBuffer());
      await fs.writeFile(path.join(galleryDir, fileName), photoBuffer);
      photoPaths.push(`/gallery/${eventId}/${fileName}`);
    }

    const event = {
      id: eventId,
      title,
      description: description || undefined,
      poster: `/gallery/${eventId}/${posterFileName}`,
      images: photoPaths,
      academicYear,
    };

    await insertGalleryEvent(event);

    // The public Gallery is cached — without this the new album would not show
    // until the cache happened to expire.
    revalidatePath("/gallery");
    revalidatePath(`/gallery/${eventId}`);
    revalidatePath("/admin/gallery");

    return NextResponse.json({ success: true, event });
  } catch (error) {
    if (createdDir) {
      try {
        await fs.rm(createdDir, { recursive: true, force: true });
      } catch (cleanupErr) {
        console.error("Directory cleanup failed:", cleanupErr);
      }
    }

    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Gallery event creation failed:", error);
    const message = error instanceof Error ? error.message : "Failed to create gallery event.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
