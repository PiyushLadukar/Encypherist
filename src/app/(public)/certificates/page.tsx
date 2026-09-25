import type { Metadata } from "next";
import { SectionHeading } from "@/components/site/section-heading";
import { CertificateSearch } from "@/components/certificates/certificate-search";
import { CertificateVerify } from "@/components/certificates/certificate-verify";

/**
 * Deliberately absent from NAV_LINKS — reachable by typing /certificates, not
 * advertised in the header. `robots: noindex` keeps it out of search results
 * too; drop that if the page should be findable.
 */
export const metadata: Metadata = {
  title: "Certificates — Encypherist",
  description: "Find, download and verify certificates issued by Encypherist.",
  robots: { index: false, follow: false },
};

export default function CertificatesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Issued & verifiable"
        title="Find your certificate."
        description="Every certificate here resolves to a live record. Search with the name you registered with, or the certificate ID."
      />

      <div className="mt-12">
        <CertificateSearch />
      </div>

      <div className="mt-20 border-t border-border pt-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Verify</p>
        <h2 className="mt-3 text-balance font-heading text-2xl font-semibold tracking-tight text-foreground">
          Check a certificate is genuine.
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Recruiters and institutions can confirm any certificate here. Enter the ID printed on it —
          the result comes straight from the issuing record, not the document.
        </p>
        <div className="mt-8">
          <CertificateVerify />
        </div>
      </div>
    </div>
  );
}
