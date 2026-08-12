import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { PRINCIPLES } from "@/lib/principles";
import { getPublishedEvents } from "@/lib/data/events";
import { getPublishedMembers } from "@/lib/data/members";
import { formatDate } from "@/lib/format";
import { ORG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About — Encypherist",
  description:
    "Mission, principles and history of Encypherist, the CSE student forum at Jhulelal Institute of Technology, Nagpur.",
};

export const dynamic = "force-dynamic";

const ORG_FACTS = [
  { label: "INSTITUTE", value: "Jhulelal Institute of Technology" },
  { label: "DEPARTMENT", value: "Computer Science & Engineering" },
  { label: "AFFILIATION", value: "RTM Nagpur University" },
  { label: "ACCREDITATION", value: "NAAC A+" },
  { label: "DTE_CODE", value: "EN4139" },
  { label: "LOCATION", value: "Lonara, Nagpur, Maharashtra" },
];

export default async function AboutPage() {
  const [events, members] = await Promise.all([
    getPublishedEvents().catch(() => []),
    getPublishedMembers().catch(() => []),
  ]);

  // Build a verified timeline from real dated events, oldest first.
  const timeline = events
    .filter((e) => e.start_at && e.confidence === "verified")
    .sort((a, b) => new Date(a.start_at!).getTime() - new Date(b.start_at!).getTime());

  const currentTenureCount = members.length;

  return (
    <div>
      {/* --------------------------------------------------------------- Header */}
      <section className="border-b border-border">
        <Reveal className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            {"// ABOUT_ENCYPHERIST"}
          </p>
          <h1 className="mt-6 max-w-3xl text-balance font-heading text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            NOT A CLUB.
            <br />
            <span className="text-primary">A RUNNING SYSTEM.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">
            Encypherist is the Computer Science &amp; Engineering student forum at{" "}
            {ORG.college}, {ORG.city}. &ldquo;A place where geeks get together&rdquo; —
            that&apos;s the forum&apos;s own words, not marketing copy.
          </p>
        </Reveal>
      </section>

      {/* ------------------------------------------------------- Mission/vision */}
      <section className="border-b border-border bg-card/30">
        <Reveal className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
          <div className="space-y-10">
            <div>
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Mission
              </h2>
              <p className="mt-3 max-w-2xl text-xl leading-relaxed text-foreground">
                Give CSE students a real, hands-on layer under their degree — technical
                activities, competitions and outreach, run entirely by the students who
                show up to build them.
              </p>
            </div>
            <div>
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Department Vision
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                &ldquo;To emerge as the best Computer Science &amp; Engineering
                Department through Quality Education, Industry alliances &amp;
                Collaborative Research.&rdquo;
              </p>
              <p className="mt-2 font-mono text-[11px] text-muted-foreground/60">
                — as published by the Department of CSE, {ORG.college}
              </p>
            </div>
          </div>

          <div className="border border-border p-6">
            <p className="font-mono text-xs uppercase tracking-wider text-primary">
              ORG_FACTS
            </p>
            <dl className="mt-4 space-y-3">
              {ORG_FACTS.map((fact) => (
                <div key={fact.label}>
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    {fact.label}
                  </dt>
                  <dd className="text-sm text-foreground">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </section>

      {/* -------------------------------------------------------------- Culture */}
      <section className="border-b border-border">
        <Reveal className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="// COMMUNITY_LAYER"
            title="Because geeks are code blooded."
            description={`That's the forum's public tagline, word for word. Every tenure — a new student council spanning final, third and second year — runs the same system: technical activities, seminars, competitions, and community outreach, planned and executed entirely by students. ${currentTenureCount} people are running it right now.`}
          />
        </Reveal>
      </section>

      {/* ---------------------------------------------------------- Principles */}
      <section className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="// CORE_PRINCIPLES" title="How the system runs." />
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
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              {"// WHAT_WE_BUILD"}
            </p>
            <h2 className="max-w-2xl text-balance font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              See it, don&apos;t just read about it.
            </h2>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                className="font-mono text-sm"
                nativeButton={false}
                render={<Link href="/projects" />}
              >
                Build log
                <ArrowUpRight className="size-4" />
              </Button>
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
