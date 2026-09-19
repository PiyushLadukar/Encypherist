import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { AdminAuthError, requireAdminApi } from "@/lib/admin-guard";
import { deleteGalleryEvent, isStaticGalleryEvent } from "@/lib/data/gallery-events";

/** Guards against an id from the URL escaping public/gallery/ via "..", a slash or a drive letter. */
function isSafeEventId(id: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
}

/**
 * Removes an admin-created album: the database record first, then its photo
 * directory. Albums hard-coded in src/data/gallery.ts cannot be removed here —
 * they would reappear on the next request, since the static catalog is part of
 * the build.
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminApi();

    const { id } = await params;

    if (!isSafeEventId(id)) {
      return NextResponse.json({ error: "Invalid event id." }, { status: 400 });
    }

    if (isStaticGalleryEvent(id)) {
      return NextResponse.json(
        { error: "This album is part of the site's built-in catalog and cannot be deleted here." },
        { status: 400 }
      );
    }

    const deleted = await deleteGalleryEvent(id);
    if (!deleted) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    // Best effort: the record is already gone, so a failure to remove the
    // files should not present as a failed delete. It leaves an orphaned
    // directory, which is harmless and visible on disk.
    const galleryDir = path.join(process.cwd(), "public", "gallery", id);
    try {
      await fs.rm(galleryDir, { recursive: true, force: true });
    } catch (err) {
      console.error(`Gallery: removed record "${id}" but could not delete ${galleryDir}.`, err);
    }

    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Gallery event deletion failed:", error);
    return NextResponse.json({ error: "Failed to delete gallery event." }, { status: 500 });
  }
}
