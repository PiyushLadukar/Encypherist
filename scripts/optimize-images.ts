/**
 * Downscales and re-encodes every image in public/ in place.
 *
 * The photographs were committed straight from a camera — 8160x6120 at ~8 MB
 * each — but nothing on the site displays them larger than ~1920px. Serving
 * the originals meant a single gallery page pulled tens of megabytes. This
 * caps each image at the size its largest on-screen use actually needs.
 *
 * Filenames and extensions are preserved exactly: member photo paths live in
 * seed/members.json (and the seeded database), and gallery paths are built by
 * string template in src/data/gallery.ts, so a renamed file would break
 * references that this script cannot see.
 *
 * Back up public/ before running — this overwrites in place.
 *
 * Usage:
 *   npx tsx scripts/optimize-images.ts            # apply
 *   npx tsx scripts/optimize-images.ts --dry-run  # report only, write nothing
 */
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

/** Longest-edge cap per directory, matched to the largest place each image renders. */
const RULES: { match: string; maxEdge: number; quality: number }[] = [
  // Lightbox opens these fullscreen — needs headroom above a 1920px viewport.
  { match: path.join("public", "gallery"), maxEdge: 2400, quality: 82 },
  // Member cards render at max-w-sm (384px) on a 4:5 crop.
  { match: path.join("public", "images", "members"), maxEdge: 1200, quality: 82 },
];
const DEFAULT_RULE = { maxEdge: 2000, quality: 82 };

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const CONCURRENCY = 2;

/**
 * Windows holds transient locks on files in public/ — a running `next start`
 * serving them, or Defender scanning a file it has just seen written. Both
 * surface as an "UNKNOWN: unknown error, open" and both clear on their own.
 */
const RETRIES = 4;
const RETRY_DELAY_MS = 400;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < RETRIES) await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }
  throw lastErr;
}

function ruleFor(file: string) {
  return RULES.find((r) => file.startsWith(r.match)) ?? DEFAULT_RULE;
}

async function walk(dir: string, acc: string[] = []): Promise<string[]> {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, acc);
    else if (IMAGE_EXTS.has(path.extname(entry.name).toLowerCase())) acc.push(full);
  }
  return acc;
}

/**
 * Re-encodes into the file's existing format. `.rotate()` with no argument
 * bakes in the EXIF orientation before the metadata is dropped — without it,
 * photos shot in portrait come out sideways once the EXIF tag is gone.
 */
async function encode(file: string, maxEdge: number, quality: number): Promise<Buffer> {
  const ext = path.extname(file).toLowerCase();
  // failOn: "none" — a few of the source photos carry minor JPEG corruption
  // that libvips would otherwise refuse outright.
  const pipeline = sharp(file, { failOn: "none" })
    .rotate()
    .resize({ width: maxEdge, height: maxEdge, fit: "inside", withoutEnlargement: true });

  if (ext === ".png") return pipeline.png({ compressionLevel: 9, palette: true }).toBuffer();
  if (ext === ".webp") return pipeline.webp({ quality }).toBuffer();
  return pipeline.jpeg({ quality, mozjpeg: true, progressive: true }).toBuffer();
}

/**
 * Records the final pixel dimensions of every public image.
 *
 * next/image needs width and height to reserve space before the file loads,
 * and the gallery collage is a masonry layout whose photos each have their own
 * aspect ratio — there is no single ratio the components could assume. The
 * paths are built by string template at runtime, so a static import (which
 * would carry the dimensions automatically) is not available either.
 */
async function writeManifest(files: string[], publicDir: string) {
  const manifest: Record<string, { width: number; height: number }> = {};
  const unreadable: string[] = [];

  for (const file of files) {
    // Keys are the public URL: public/gallery/a/b.jpg -> /gallery/a/b.jpg
    const key = "/" + path.relative(publicDir, file).split(path.sep).join("/");
    try {
      const meta = await withRetry(() => sharp(file, { failOn: "none" }).metadata());
      if (meta.width && meta.height) manifest[key] = { width: meta.width, height: meta.height };
      else unreadable.push(key);
    } catch {
      unreadable.push(key);
    }
  }

  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  const target = path.join(process.cwd(), "src", "data", "image-dimensions.json");
  await fs.writeFile(target, JSON.stringify(sorted, null, 2) + "\n", "utf-8");

  return { count: Object.keys(sorted).length, unreadable };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const publicDir = path.join(process.cwd(), "public");

  const files = await walk(publicDir);
  files.sort();

  let before = 0;
  let after = 0;
  let rewritten = 0;
  let kept = 0;
  const failures: { file: string; message: string }[] = [];

  const queue = [...files];
  async function worker() {
    for (let file = queue.pop(); file; file = queue.pop()) {
      const rel = path.relative(process.cwd(), file);
      const originalSize = (await fs.stat(file)).size;
      before += originalSize;

      try {
        const { maxEdge, quality } = ruleFor(path.relative(process.cwd(), file));

        // Already within its cap — almost certainly optimised by an earlier
        // run. Re-encoding would only stack another generation of JPEG loss
        // onto it, so a repeat run must leave it alone.
        const meta = await withRetry(() => sharp(file, { failOn: "none" }).metadata());
        if ((meta.width ?? 0) <= maxEdge && (meta.height ?? 0) <= maxEdge) {
          after += originalSize;
          kept++;
          continue;
        }

        const buf = await withRetry(() => encode(file, maxEdge, quality));

        // Re-encoding can inflate an already-small or already-optimised file.
        // Keeping the original is always the better outcome there.
        if (buf.length >= originalSize) {
          after += originalSize;
          kept++;
          continue;
        }

        if (!dryRun) await withRetry(() => fs.writeFile(file, buf));
        after += buf.length;
        rewritten++;
      } catch (err) {
        after += originalSize;
        failures.push({ file: rel, message: err instanceof Error ? err.message : String(err) });
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  const saved = before - after;

  console.log(dryRun ? "\nDRY RUN — nothing written\n" : "\nOptimised public/\n");
  console.log(`  scanned    ${files.length} images`);
  console.log(`  rewritten  ${rewritten}`);
  console.log(`  unchanged  ${kept} (already within cap, or re-encode was no smaller)`);
  console.log(`  before     ${mb(before)}`);
  console.log(`  after      ${mb(after)}`);
  console.log(`  saved      ${mb(saved)} (-${((saved / before) * 100).toFixed(0)}%)`);

  if (failures.length) {
    console.log(`\n  ${failures.length} file(s) could not be processed and were left untouched:`);
    for (const f of failures) console.log(`    ${f.file} — ${f.message}`);
    console.log("\n  These are locked by another process — stop `next dev`/`next start` and re-run.");
  }

  if (!dryRun) {
    const { count, unreadable } = await writeManifest(files, publicDir);
    console.log(`\n  wrote src/data/image-dimensions.json (${count} images)`);
    if (unreadable.length) {
      console.log(`  ${unreadable.length} image(s) missing from the manifest (locked or unreadable):`);
      for (const u of unreadable) console.log(`    ${u}`);
    }
  }
  console.log();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
