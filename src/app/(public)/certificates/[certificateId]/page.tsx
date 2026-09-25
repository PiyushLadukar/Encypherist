import type { Metadata } from "next";
import { CertificateDetail } from "@/components/certificates/certificate-detail";

export const metadata: Metadata = {
  title: "Certificate — Encypherist",
  robots: { index: false, follow: false },
};

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const { certificateId } = await params;
  return <CertificateDetail certificateId={certificateId} />;
}
