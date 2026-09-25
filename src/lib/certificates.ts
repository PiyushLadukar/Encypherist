/**
 * Client for EnCertify's public certificate API (encertify.vercel.app).
 *
 * Called from the browser, not the server, on purpose: EnCertify rate-limits
 * per IP, so proxying through our own server would put every visitor behind one
 * shared bucket. Its CORS allowlist already names this site's origins.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_ENCERTIFY_API ?? "https://encertify.vercel.app/api/public/certificates";

/** Shortest query EnCertify accepts — anything less is a 400. */
export const MIN_QUERY_LENGTH = 3;

export type CertificateStatus = "valid" | "revoked";

export type Certificate = {
  certificateId: string;
  recipientName: string;
  eventName: string;
  /** Always null today — EnCertify has no semester column. Kept so the filter can appear if that changes. */
  semester: string | null;
  issuedAt: string;
  status: CertificateStatus;
  viewUrl: string;
  downloadUrl: string;
};

export type CertificateFilters = {
  events: { id: string; name: string; issuedCount: number }[];
  semesters: string[];
};

export type SearchResponse = {
  results: Certificate[];
  total: number;
  page: number;
  limit: number;
};

export type VerifyResult =
  | { status: "verified"; certificate: Omit<Certificate, "status" | "viewUrl" | "downloadUrl"> }
  | { status: "revoked"; certificate?: unknown }
  | { status: "not_found" };

export class CertificateApiError extends Error {}

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { signal, headers: { Accept: "application/json" } });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new CertificateApiError("Couldn't reach the certificate service. Check your connection.");
  }

  // 404 is a real answer from /verify, not a failure — let callers read the body.
  if (!res.ok && res.status !== 404) {
    const message =
      res.status === 429
        ? "Too many searches. Wait a moment and try again."
        : await res
            .json()
            .then((b: { message?: string }) => b.message)
            .catch(() => null);
    throw new CertificateApiError(message ?? "The certificate service returned an error.");
  }

  return (await res.json()) as T;
}

export function getFilters(signal?: AbortSignal): Promise<CertificateFilters> {
  return get<CertificateFilters>("/filters", signal);
}

export function searchCertificates(
  params: { q: string; event?: string; semester?: string; page?: number },
  signal?: AbortSignal
): Promise<SearchResponse> {
  const query = new URLSearchParams({ q: params.q.trim() });
  if (params.event) query.set("event", params.event);
  if (params.semester) query.set("semester", params.semester);
  if (params.page && params.page > 1) query.set("page", String(params.page));
  return get<SearchResponse>(`/search?${query}`, signal);
}

/** One certificate, or null when EnCertify has no record with that id. */
export async function getCertificate(
  certificateId: string,
  signal?: AbortSignal
): Promise<Certificate | null> {
  const body = await get<Certificate | { error: string }>(
    `/${encodeURIComponent(certificateId.trim())}`,
    signal
  );
  return "certificateId" in body ? body : null;
}

export function verifyCertificate(certificateId: string, signal?: AbortSignal): Promise<VerifyResult> {
  return get<VerifyResult>(`/verify/${encodeURIComponent(certificateId.trim())}`, signal);
}

export function formatIssuedDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
