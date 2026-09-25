"use client";

import { useState, type FormEvent } from "react";
import { BadgeCheck, Loader2, ShieldAlert, ShieldX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  verifyCertificate,
  formatIssuedDate,
  CertificateApiError,
  type VerifyResult,
} from "@/lib/certificates";

export function CertificateVerify() {
  const [id, setId] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = id.trim();
    if (!trimmed) return;

    setChecking(true);
    setError(null);
    setResult(null);
    try {
      setResult(await verifyCertificate(trimmed));
    } catch (err) {
      setError(err instanceof CertificateApiError ? err.message : "Something went wrong.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <section>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="CERT-2026-XXXXXX"
          aria-label="Certificate ID to verify"
          autoComplete="off"
          spellCheck={false}
          className="h-11 font-mono sm:flex-1"
        />
        <Button type="submit" size="lg" disabled={checking || !id.trim()} className="font-mono text-xs uppercase tracking-wider">
          {checking ? <Loader2 className="size-4 animate-spin" /> : "Verify"}
        </Button>
      </form>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {result && <VerdictPanel result={result} queriedId={id.trim()} />}
    </section>
  );
}

function VerdictPanel({ result, queriedId }: { result: VerifyResult; queriedId: string }) {
  if (result.status === "verified") {
    const c = result.certificate;
    return (
      <div className="mt-5 rounded-xl border border-verified/30 bg-verified/5 p-5">
        <div className="flex items-center gap-2 text-verified">
          <BadgeCheck className="size-5" />
          <p className="font-mono text-xs uppercase tracking-[0.2em]">Verified</p>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          This certificate matches a live record issued by Encypherist.
        </p>
        <dl className="mt-5 space-y-2 border-t border-verified/20 pt-4 text-sm">
          <Row label="Issued to" value={c.recipientName} />
          <Row label="Event" value={c.eventName} />
          <Row label="Issued" value={formatIssuedDate(c.issuedAt)} />
          {c.semester && <Row label="Semester" value={c.semester} />}
          <Row label="Certificate ID" value={c.certificateId} mono />
        </dl>
      </div>
    );
  }

  if (result.status === "revoked") {
    return (
      <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <div className="flex items-center gap-2 text-destructive">
          <ShieldAlert className="size-5" />
          <p className="font-mono text-xs uppercase tracking-[0.2em]">Revoked</p>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          This certificate existed but has been revoked by the issuer. It is no longer valid.
        </p>
        <p className="mt-4 border-t border-destructive/20 pt-4 font-mono text-xs text-muted-foreground">
          {queriedId}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-foreground">
        <ShieldX className="size-5 text-muted-foreground" />
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Not found</p>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        No certificate matches this ID. A well-formatted ID proves nothing on its own — every check
        here hits the live record.
      </p>
      <p className="mt-4 border-t border-border pt-4 font-mono text-xs text-muted-foreground">
        {queriedId}
      </p>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className={mono ? "text-right font-mono text-xs text-foreground" : "text-right text-foreground"}>
        {value}
      </dd>
    </div>
  );
}
