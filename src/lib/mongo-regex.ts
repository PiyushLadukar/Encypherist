import "server-only";

/** Escapes regex metacharacters so a user-supplied search term is matched literally, not as a pattern. */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
