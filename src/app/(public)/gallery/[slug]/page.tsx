import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EventCollage } from "@/components/gallery/event-collage";
import { GalleryBackground } from "@/components/gallery/gallery-background";
import { Reveal } from "@/components/site/reveal";
import { galleryEvents } from "@/data/gallery";

export function generateStaticParams() {
  return galleryEvents.map((event) => ({ slug: event.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = galleryEvents.find((e) => e.id === slug);
  if (!event) return { title: "Gallery — Encypherist" };
  return {
    title: `${event.title} — Gallery — Encypherist`,
    description: event.description ?? `Photos from ${event.title}, an Encypherist event.`,
  };
}

export default async function GalleryEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = galleryEvents.find((e) => e.id === slug);
  if (!event) notFound();

  const index = galleryEvents.findIndex((e) => e.id === slug);
  const number = String(index + 1).padStart(2, "0");

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <GalleryBackground />

      <Link
        href="/gallery"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-3.5" />
        All gallery
      </Link>

      <Reveal className="mt-8 grid gap-6 border-b border-border pb-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(15rem,0.65fr)] lg:items-end">
        <div className="order-last overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_2px_20px_-8px_rgba(0,0,0,0.1)] lg:order-first">
          <div className="relative aspect-[16/10]">
            <img
              src={event.poster}
              alt={`${event.title} event poster`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="flex flex-col justify-end lg:pb-2">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
            Event / {number}
          </p>
          <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {event.title}
          </h1>
          {event.description && (
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{event.description}</p>
          )}
          <p className="mt-6 font-mono text-xs text-muted-foreground">
            {event.images.length} {event.images.length === 1 ? "photograph" : "photographs"}
          </p>
        </div>
      </Reveal>

      <div className="mt-12">
        <EventCollage event={event} />
      </div>
    </div>
  );
}
