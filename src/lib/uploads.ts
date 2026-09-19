import "server-only";
import { randomUUID } from "node:crypto";
import path from "node:path";
import fs from "node:fs/promises";
import { fileTypeFromBuffer } from "file-type";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export class UploadError extends Error {}

/**
 * Validates an uploaded image (size, then extension/MIME/actual magic-byte
 * content all agree — never trust the browser-supplied name or MIME type
 * alone) and writes it to public/uploads/<subdir>/<uuid>.<ext>. Returns the
 * public URL path to store on the record.
 */
export async function saveUploadedImage(file: File, subdir: string): Promise<string> {
  if (file.size <= 0) throw new UploadError("The uploaded file is empty.");
  if (file.size > MAX_FILE_BYTES) throw new UploadError("File is too large — the limit is 5MB.");

  const buffer = Buffer.from(await file.arrayBuffer());
  const sniffed = await fileTypeFromBuffer(buffer);

  if (!sniffed || !(sniffed.mime in ALLOWED_MIME_TO_EXT)) {
    throw new UploadError("Only JPG, PNG and WEBP images are allowed.");
  }
  if (file.type && file.type !== sniffed.mime) {
    throw new UploadError("The file's contents don't match its declared type.");
  }

  const ext = ALLOWED_MIME_TO_EXT[sniffed.mime];
  const fileName = `${randomUUID()}.${ext}`;
  const safeSubdir = subdir.replace(/[^a-zA-Z0-9-_]/g, "");
  const dir = path.join(process.cwd(), "public", "uploads", safeSubdir);

  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, fileName), buffer);

  return `/uploads/${safeSubdir}/${fileName}`;
}

/** Best-effort cleanup of a previously stored upload — never lets a delete failure block the caller. */
export async function deleteUploadedFile(publicPath: string | null | undefined): Promise<void> {
  if (!publicPath || !publicPath.startsWith("/uploads/")) return;
  try {
    await fs.unlink(path.join(process.cwd(), "public", publicPath));
  } catch {
    // Already gone or never existed — fine.
  }
}
