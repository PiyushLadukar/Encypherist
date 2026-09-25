import "server-only";

/**
 * Best-effort per-IP rate limiting for the public, unauthenticated endpoints
 * (event registration, registration file upload, admin self-signup).
 *
 * Deliberately in-memory: this runs on serverless, so each instance keeps its
 * own counters and a determined attacker spread across instances gets a higher
 * effective limit than the numbers below suggest. That is an accepted trade —
 * it costs nothing, needs no extra service, and stops the case that actually
 * happens, which is one script hammering one endpoint. If abuse ever gets past
 * it, move `hit()` onto Upstash/Vercel KV; every call site stays the same.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Stops the Map growing without bound on a long-lived instance. */
function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

export function hit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }

  bucket.count += 1;
  return { ok: true };
}

/**
 * Client IP behind Vercel's proxy. `x-forwarded-for` is spoofable in general,
 * but Vercel appends the real peer address as the last entry, so the last hop
 * is the one worth trusting.
 */
export function getClientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return headers.get("x-real-ip") ?? "unknown";
}

export function getClientIp(request: Request): string {
  return getClientIpFromHeaders(request.headers);
}

export function tooManyRequests(retryAfterSeconds: number): Response {
  return new Response(
    JSON.stringify({ error: "Too many requests. Wait a moment and try again." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSeconds),
      },
    }
  );
}
