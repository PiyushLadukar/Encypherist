import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { galleryEvents, DEFAULT_ACADEMIC_YEARS } from "@/data/gallery";

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

export async function POST(request: Request) {
  let createdDir: string | null = null;

  try {
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

    // Check if event ID already exists in catalog
    if (galleryEvents.some((e) => e.id === eventId)) {
      return NextResponse.json(
        { error: `An event with ID "${eventId}" already exists.` },
        { status: 400 }
      );
    }

    const galleryDir = path.join(process.cwd(), "public", "gallery", eventId);

    // Check if folder already exists on disk
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

    // Create target directory
    await fs.mkdir(galleryDir, { recursive: true });
    createdDir = galleryDir;

    // Save poster image
    const posterExt = getExt(posterFile, ".jpg");
    const posterFileName = `poster${posterExt}`;
    const posterPath = path.join(galleryDir, posterFileName);
    const posterBuffer = Buffer.from(await posterFile.arrayBuffer());
    await fs.writeFile(posterPath, posterBuffer);

    // Save photos sequentially (photo-1.jpg, photo-2.jpg, ...)
    const photoPaths: string[] = [];
    const photoExts: string[] = [];

    for (let i = 0; i < photoFiles.length; i++) {
      const photoFile = photoFiles[i];
      const ext = getExt(photoFile, ".jpg");
      const fileName = `photo-${i + 1}${ext}`;
      const photoPath = path.join(galleryDir, fileName);
      const photoBuffer = Buffer.from(await photoFile.arrayBuffer());
      await fs.writeFile(photoPath, photoBuffer);
      photoPaths.push(`/gallery/${eventId}/${fileName}`);
      photoExts.push(ext);
    }

    const posterRelPath = `/gallery/${eventId}/${posterFileName}`;

    // Read and update src/data/gallery.ts
    const galleryTsPath = path.join(process.cwd(), "src", "data", "gallery.ts");
    let galleryTsContent = await fs.readFile(galleryTsPath, "utf-8");

    const descriptionLine = description ? `\n    description: ${JSON.stringify(description)},` : "";
    const allSameExt = photoExts.every((e) => e === photoExts[0]);

    const imagesCode = allSameExt
      ? `Array.from({ length: ${photoFiles.length} }, (_, index) => \`/gallery/${eventId}/photo-\${index + 1}${photoExts[0]}\`)`
      : JSON.stringify(photoPaths);

    const newEventEntry = `  {
    id: ${JSON.stringify(eventId)},
    title: ${JSON.stringify(title)},${descriptionLine}
    poster: ${JSON.stringify(posterRelPath)},
    images: ${imagesCode},
    academicYear: ${JSON.stringify(academicYear)},
  },`;

    const lastBracketIndex = galleryTsContent.lastIndexOf("];");
    if (lastBracketIndex === -1) {
      throw new Error("Could not find galleryEvents array in src/data/gallery.ts");
    }

    galleryTsContent =
      galleryTsContent.slice(0, lastBracketIndex) +
      newEventEntry +
      "\n" +
      galleryTsContent.slice(lastBracketIndex);

    await fs.writeFile(galleryTsPath, galleryTsContent, "utf-8");

    return NextResponse.json({
      success: true,
      event: {
        id: eventId,
        title,
        description,
        poster: posterRelPath,
        images: photoPaths,
        academicYear,
      },
    });
  } catch (error: any) {
    // Clean up created directory on failure to avoid leaving partial data
    if (createdDir) {
      try {
        await fs.rm(createdDir, { recursive: true, force: true });
      } catch (cleanupErr) {
        console.error("Directory cleanup failed:", cleanupErr);
      }
    }
    console.error("Gallery event creation failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create gallery event." },
      { status: 500 }
    );
  }
}
