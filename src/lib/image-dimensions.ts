import dimensions from "@/data/image-dimensions.json";

/**
 * Pixel dimensions for every file under public/, keyed by its public URL
 * ("/gallery/disha/poster.jpg"). Regenerate with `npm run optimize:images`.
 *
 * next/image needs width and height up front to reserve layout space. Static
 * imports would supply them, but gallery and member paths are assembled from
 * strings at runtime, so they are looked up here instead.
 */
const MANIFEST = dimensions as Record<string, { width: number; height: number }>;

/** Fallback ratio for an image absent from the manifest — 4:3, the most common shape in the set. */
const FALLBACK = { width: 1600, height: 1200 };

/**
 * Accepts a value straight from the gallery catalog or the database, which may
 * carry a query string, and may be a remote URL that the manifest cannot know
 * about. Always returns usable numbers so a caller never has to branch.
 */
export function getImageDimensions(src: string | null | undefined): { width: number; height: number } {
  if (!src) return FALLBACK;
  const key = src.split("?")[0];
  return MANIFEST[key] ?? FALLBACK;
}

/** True when the manifest actually knows this path — useful where a wrong ratio would be worse than none. */
export function hasImageDimensions(src: string | null | undefined): boolean {
  if (!src) return false;
  return Boolean(MANIFEST[src.split("?")[0]]);
}
