"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Download, Eye, Loader2, Search, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  getFilters,
  searchCertificates,
  formatIssuedDate,
  MIN_QUERY_LENGTH,
  CertificateApiError,
  type Certificate,
  type CertificateFilters,
} from "@/lib/certificates";

export function CertificateSearch() {
  const [query, setQuery] = useState("");
  const [event, setEvent] = useState<string | null>(null);
  const [semester, setSemester] = useState<string | null>(null);
  const [filters, setFilters] = useState<CertificateFilters | null>(null);
  const [results, setResults] = useState<Certificate[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getFilters(controller.signal)
      .then(setFilters)
      .catch(() => {
        // A missing filter list shouldn't block searching — the input still works.
      });
    return () => controller.abort();
  }, []);

  const trimmed = query.trim();
  const tooShort = trimmed.length > 0 && trimmed.length < MIN_QUERY_LENGTH;
  /** Below the minimum we simply stop rendering results rather than clearing them,
   *  so shortening the query never needs a state write from inside the effect. */
  const active = trimmed.length >= MIN_QUERY_LENGTH;

  useEffect(() => {
    if (!active) return;

    const controller = new AbortController();
    requestRef.current?.abort();
    requestRef.current = controller;

    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
      searchCertificates(
        { q: trimmed, event: event ?? undefined, semester: semester ?? undefined },
        controller.signal
      )
        .then((data) => {
          setResults(data.results);
          setTotal(data.total);
        })
        .catch((err) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setError(err instanceof CertificateApiError ? err.message : "Something went wrong.");
          setResults(null);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [active, trimmed, event, semester]);

  return (
    <section>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="certificate-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Your name or certificate ID"
          autoComplete="off"
          aria-label="Search by name or certificate ID"
          className="h-12 pl-10 text-base"
        />
        {active && loading && (
          <Loader2 className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>
      <p className="mt-2 font-mono text-[11px] text-muted-foreground">
        {tooShort
          ? `Keep typing — at least ${MIN_QUERY_LENGTH} characters.`
          : "Part of a name works too — “rah” finds “Rahul Sharma”."}
      </p>

      {filters && filters.events.length > 0 && (
        <FilterRow
          label="Event"
          options={filters.events.map((e) => ({ value: e.id, label: e.name, count: e.issuedCount }))}
          selected={event}
          onSelect={setEvent}
        />
      )}

      {/* EnCertify has no semester field today, so this stays hidden until it returns values. */}
      {filters && filters.semesters.length > 0 && (
        <FilterRow
          label="Semester"
          options={filters.semesters.map((s) => ({ value: s, label: s }))}
          selected={semester}
          onSelect={setSemester}
        />
      )}

      <div className="mt-8">
        {!active ? (
          <Message>Search with your name or certificate ID to find your certificate.</Message>
        ) : error ? (
          <Message tone="error">{error}</Message>
        ) : results === null ? (
          <Message>Searching…</Message>
        ) : results.length === 0 ? (
          <Message>
            No certificate found for “{trimmed}”. Check the spelling, or try just your first name.
          </Message>
        ) : (
          <>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {total} {total === 1 ? "certificate" : "certificates"}
            </p>
            <ul className="space-y-3">
              {results.map((c) => (
                <CertificateCard key={c.certificateId} certificate={c} />
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}

function FilterRow({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: { value: string; label: string; count?: number }[];
  selected: string | null;
  onSelect: (value: string | null) => void;
}) {
  return (
    <div className="mt-6">
      <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Pill active={selected === null} onClick={() => onSelect(null)}>
          All
        </Pill>
        {options.map((o) => (
          <Pill key={o.value} active={selected === o.value} onClick={() => onSelect(o.value)}>
            {o.label}
            {o.count !== undefined && <span className="ml-1.5 opacity-60">{o.count}</span>}
          </Pill>
        ))}
      </div>
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function CertificateCard({ certificate }: { certificate: Certificate }) {
  const revoked = certificate.status === "revoked";

  return (
    <li className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-heading text-lg font-semibold text-foreground">
            {certificate.recipientName}
          </p>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{certificate.eventName}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
            <span className="text-foreground/70">{certificate.certificateId}</span>
            <span aria-hidden>·</span>
            <span>{formatIssuedDate(certificate.issuedAt)}</span>
            {certificate.semester && (
              <>
                <span aria-hidden>·</span>
                <span>{certificate.semester}</span>
              </>
            )}
          </div>
        </div>

        {revoked ? (
          <span className="shrink-0 rounded-full border border-destructive/30 bg-destructive/5 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-destructive">
            Revoked
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-verified/30 bg-verified/5 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-verified">
            <ShieldCheck className="size-3" />
            Verified
          </span>
        )}
      </div>

      {revoked ? (
        <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
          This certificate has been revoked and can no longer be downloaded.
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          {/* Stays on this site — the PDF is embedded on our own detail page
              rather than handing the visitor off to EnCertify. */}
          <Link
            href={`/certificates/${encodeURIComponent(certificate.certificateId)}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Eye className="size-3.5" />
            View
          </Link>
          <a
            href={certificate.downloadUrl}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          >
            <Download className="size-3.5" />
            Download
          </a>
        </div>
      )}
    </li>
  );
}

function Message({ children, tone }: { children: React.ReactNode; tone?: "error" }) {
  return (
    <p
      className={cn(
        "rounded-lg border px-4 py-8 text-center text-sm",
        tone === "error"
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-dashed border-border text-muted-foreground"
      )}
    >
      {children}
    </p>
  );
}
