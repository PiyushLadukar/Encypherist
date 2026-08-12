import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { getPublishedMembers } from "@/lib/data/members";
import { getPublishedEvents } from "@/lib/data/events";
import { PRINCIPLES } from "@/lib/principles";
import { formatDate } from "@/lib/format";
import { ORG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About — Encypherist",
  description:
    "Mission, principles and history of Encypherist, the CSE student forum at Jhulelal Institute of Technology, Nagpur.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const members = await getPublishedMembers().catch(() => []);
  const timeline = await getPublishedEvents().catch(() => []);

  const currentTenureCount = members.length;

  return (
    <div>
      {/* --------------------------------------------------------------- Header */}
      <section className="border-b border-border">
        <Reveal className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_480px] lg:gap-14 items-center">
            <div>
              <h1 className="text-balance font-heading text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                NOT A CLUB.
                <br />
                <span className="text-primary">A RUNNING SYSTEM.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">
                Encypherist is the Computer Science &amp; Engineering student forum at{" "}
                {ORG.college}, {ORG.city}. &ldquo;A place where geeks get together&rdquo; —
                that&apos;s the forum&apos;s own words, not marketing copy.
              </p>
            </div>

            <div className="w-full max-w-[480px] mx-auto lg:mx-0">
              <div className="group overflow-hidden border border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/50">
                <div className="w-full overflow-hidden">
                  <Image
                    src="/images/about/community-outreach.jpg"
                    alt="Encypherist Community Outreach & Social Drive"
                    width={640}
                    height={400}
                    className="w-full h-64 sm:h-72 object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                </div>
                <div className="p-3 bg-card border-t border-border flex items-center justify-between">
                  <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
                    Community Outreach &bull; DISHA Drive
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ------------------------------------------------------- Mission/vision */}
      <section className="border-b border-border bg-card/30">
        <Reveal className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 space-y-12">
          {/* Row 1: Image Left, Mission Right */}
          <div className="grid gap-8 lg:grid-cols-[420px_1fr] lg:gap-14 items-center">
            <div className="w-full max-w-[420px] mx-auto lg:mx-0">
              <div className="group overflow-hidden border border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/50">
                <div className="w-full overflow-hidden">
                  <Image
                    src="/images/about/lab-presentation.jpg"
                    alt="Encypherist Forum Hall & Presentation"
                    width={560}
                    height={350}
                    className="w-full h-56 sm:h-60 object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                </div>
                <div className="p-3 bg-card border-t border-border flex items-center justify-between">
                  <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
                    Encypherist Hall &bull; JIT
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Mission
              </h2>
              <p className="mt-3 text-xl leading-relaxed text-foreground">
                Give CSE students a real, hands-on layer under their degree — technical
                activities, competitions and outreach, run entirely by the students who
                show up to build them.
              </p>
            </div>
          </div>

          {/* Row 2: Department Vision Left, Image Right (Zig-Zag) */}
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:gap-14 items-center border-t border-border pt-12">
            <div>
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Department Vision
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                &ldquo;To emerge as the best Computer Science &amp; Engineering
                Department through Quality Education, Industry alliances &amp;
                Collaborative Research.&rdquo;
              </p>
              <p className="mt-2 font-mono text-[11px] text-muted-foreground/60">
                — as published by the Department of CSE, {ORG.college}
              </p>
            </div>

            <div className="w-full max-w-[420px] mx-auto lg:mx-0">
              <div className="group overflow-hidden border border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/50">
                <div className="w-full overflow-hidden">
                  <Image
                    src="/images/about/lab-session.jpg"
                    alt="CSE Department Technical Lab Session"
                    width={560}
                    height={350}
                    className="w-full h-56 sm:h-60 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3 bg-card border-t border-border flex items-center justify-between">
                  <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
                    Technical Session &bull; CSE Department
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* -------------------------------------------------------------- Culture */}
      <section className="border-b border-border">
        <Reveal className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            title="Because geeks are code blooded."
            description={`That's the forum's public tagline, word for word. Every tenure — a new student council spanning final, third and second year — runs the same system: technical activities, seminars, competitions, and community outreach, planned and executed entirely by students. ${currentTenureCount} people are running it right now.`}
          />
        </Reveal>
      </section>

      {/* ---------------------------------------------------------- Principles */}
      <section className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <div className="w-fit rounded-full border border-border bg-card px-5 py-3 font-heading text-xl font-bold uppercase tracking-[0.26em] text-foreground sm:text-2xl">
                CORE PRINCIPLES
              </div>
              <h2 className="mt-6 text-balance font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                How the system runs.
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-12 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {PRINCIPLES.map((p) => (
                <div key={p.number} className="bg-background p-6">
                  <p className="font-mono text-xs text-primary">{p.number}</p>
                  <h3 className="mt-3 font-heading text-xl font-semibold text-foreground">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {p.description}
                  </p>
                  <div className="mt-4 border-t border-border pt-3 font-mono text-[10px] uppercase tracking-wider text-primary">
                    {p.tag}
                    <br />
                    <span className="text-muted-foreground/70">{p.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------------------- Timeline */}
      {timeline.length > 0 && (
        <section className="border-b border-border">
          <Reveal className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="// BUILD_TIMELINE"
              title="History, logged."
              description="Every entry below is a verified, dated activity — see docs/research.md for the source trail."
            />
            <ol className="mt-14 relative border-l-2 border-border pl-8 sm:pl-10">
              {timeline.map((event, i) => (
                <li key={event.id} className={i !== timeline.length - 1 ? "relative pb-10" : "relative"}>
                  <span className="absolute -left-[41px] top-1 size-3 border-2 border-background bg-primary sm:-left-[49px]" />
                  <p className="font-mono text-xs text-primary">{formatDate(event.start_at)}</p>
                  <Link
                    href={`/events/${event.slug}`}
                    className="mt-1 inline-block font-heading text-lg font-semibold text-foreground transition-colors hover:text-primary"
                  >
                    {event.title}
                  </Link>
                  {event.summary && (
                    <p className="mt-1 max-w-xl text-sm text-muted-foreground">{event.summary}</p>
                  )}
                </li>
              ))}
            </ol>
          </Reveal>
        </section>
      )}
      {/* ------------------------------------------------------------- What we build */}
      <section>
        <Reveal className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="corner-brackets flex flex-col items-center gap-6 border border-border bg-card px-6 py-16 text-center">
            <h2 className="max-w-2xl text-balance font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              See it, don&apos;t just read about it.
            </h2>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                variant="outline"
                className="font-mono text-sm"
                nativeButton={false}
                render={<Link href="/events" />}
              >
                Events
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="font-mono text-sm"
                nativeButton={false}
                render={<Link href="/members" />}
              >
                Members
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}



