"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Download, Loader2, ShieldAlert, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getCertificate,
  formatIssuedDate,
  CertificateApiError,
  type Certificate,
} from "@/lib/certificates";

type State =
  | { kind: "loading" }
  | { kind: "found"; certificate: Certificate }
  | { kind: "missing" }
  | { kind: "error"; message: string };

export function CertificateDetail({ certificateId }: { certificateId: string }) {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    getCertificate(certificateId, controller.signal)
      .then((certificate) => setState(certificate ? { kind: "found", certificate } : { kind: "missing" }))
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({
          kind: "error",
          message: err instanceof CertificateApiError ? err.message : "Something went wrong.",
        });
      });
    return () => controller.abort();
  }, [certificateId]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/certificates"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        All certificates
      </Link>

      <div className="mt-8">
        {state.kind === "loading" && (
          <div className="flex items-center gap-2 py-24 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading certificate…
          </div>
        )}

        {state.kind === "error" && (
          <Panel tone="error" icon={<ShieldAlert className="size-5" />} label="Error">
            {state.message}
          </Panel>
        )}

        {state.kind === "missing" && (
          <Panel icon={<ShieldX className="size-5 text-muted-foreground" />} label="Not found">
            No certificate matches <span className="font-mono text-foreground">{certificateId}</span>. Check
            the ID, or search by name instead.
          </Panel>
        )}

        {state.kind === "found" && <Found certificate={state.certificate} />}
      </div>
    </div>
  );
}

function Found({ certificate }: { certificate: Certificate }) {
  const revoked = certificate.status === "revoked";

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Certificate</p>
          <h1 className="mt-2 text-balance font-heading text-3xl font-semibold tracking-tight text-foreground">
            {certificate.recipientName}
          </h1>
          <p className="mt-1 text-base text-muted-foreground">{certificate.eventName}</p>
        </div>
        {revoked ? (
          <span className="shrink-0 rounded-full border border-destructive/30 bg-destructive/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-destructive">
            Revoked
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-verified/30 bg-verified/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-verified">
            <BadgeCheck className="size-3.5" />
            Verified
          </span>
        )}
      </div>

      <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-3 border-y border-border py-5 text-sm sm:grid-cols-2">
        <Row label="Certificate ID" value={certificate.certificateId} mono />
        <Row label="Issued" value={formatIssuedDate(certificate.issuedAt)} />
        <Row label="Event" value={certificate.eventName} />
        {certificate.semester && <Row label="Semester" value={certificate.semester} />}
      </dl>

      {revoked ? (
        <Panel
          tone="error"
          icon={<ShieldAlert className="size-5" />}
          label="Revoked"
          className="mt-8"
        >
          This certificate has been revoked by the issuer and can no longer be viewed or downloaded.
        </Panel>
      ) : (
        <>
          <div className="mt-8 overflow-hidden rounded-xl border border-border bg-muted/30">
            {/* The API 302s to a short-lived signed URL; the PDF has no framing
                restrictions, so it renders inline here instead of on EnCertify. */}
            <iframe
              src={certificate.downloadUrl}
              title={`Certificate for ${certificate.recipientName}`}
              className="h-[70vh] min-h-[420px] w-full"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button size="lg" className="font-mono text-xs uppercase tracking-wider" render={<a href={certificate.downloadUrl} />}>
              <Download className="size-4" />
              Download PDF
            </Button>
            <p className="text-xs text-muted-foreground">
              Can&apos;t see the preview? Use the download button — some mobile browsers don&apos;t
              render PDFs inline.
            </p>
          </div>
        </>
      )}
    </>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 sm:flex-col sm:justify-start sm:gap-1">
      <dt className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className={mono ? "text-right font-mono text-xs text-foreground sm:text-left" : "text-right text-foreground sm:text-left"}>
        {value}
      </dd>
    </div>
  );
}

function Panel({
  children,
  icon,
  label,
  tone,
  className,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  label: string;
  tone?: "error";
  className?: string;
}) {
  const error = tone === "error";
  return (
    <div
      className={`rounded-xl border p-5 ${error ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"} ${className ?? ""}`}
    >
      <div className={`flex items-center gap-2 ${error ? "text-destructive" : "text-foreground"}`}>
        {icon}
        <p className="font-mono text-xs uppercase tracking-[0.2em]">{label}</p>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
