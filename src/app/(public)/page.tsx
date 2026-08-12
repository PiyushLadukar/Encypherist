import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, AtSign, Mail, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { SystemStatusCard } from "@/components/site/system-status-card";
import { LogoMark } from "@/components/site/logo";
import { EventCard } from "@/components/events/event-card";
import { MemberCard } from "@/components/members/member-card";
import { getPublishedEvents, splitUpcomingPast } from "@/lib/data/events";
import { getPublishedMembers } from "@/lib/data/members";
import { getGallery } from "@/lib/data/gallery";
import { getSiteSettings, getSocialLinks } from "@/lib/data/settings";
import { formatDateRange } from "@/lib/format";
import { ORG } from "@/lib/constants";
import { PRINCIPLES } from "@/lib/principles";
import { PosterPlaceholder } from "@/components/events/event-card";

export const metadata: Metadata = {
  title: "Encypherist — CSE Student Forum, JIT Nagpur",
};

// Keeps the homepage in sync with admin edits to the in-memory store —
// without this it would statically freeze at build-time content.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [events, members, gallery, settings, socialLinks] = await Promise.all([
    getPublishedEvents().catch(() => []),
    getPublishedMembers().catch(() => []),
    getGallery().catch(() => []),
    getSiteSettings().catch(() => null),
    getSocialLinks().catch(() => []),
  ]);

  const { upcoming, past, announced } = splitUpcomingPast(events);
  const currentTenureMemberCount = members.filter((m) => m.team_group !== "history").length;
  const facultyMembers = members.filter((m) => m.team_group === "faculty").sort((a, b) => a.sort_order - b.sort_order);
  const coreTeam = members.filter((m) => m.is_core && m.team_group !== "history").slice(0, 8);
  const galleryPreview = gallery.slice(0, 6);
  const instagram = socialLinks.find((l) => l.platform === "instagram");

  const verifiedActivityCount = events.filter(
    (e) => e.confidence === "verified" && past.some((p) => p.id === e.id)
  ).length;

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:64px_64px] opacity-[0.15]"
        />
        <div className="canvas-frame relative mx-3 my-6 sm:mx-6 sm:my-10 lg:mx-8">
          <div className="grid lg:grid-cols-[1.3fr_0.7fr] items-stretch">
            <div className="corner-brackets p-6 py-16 sm:p-10 sm:py-24 lg:border-r lg:border-border">
              <div className="w-fit rounded-full border border-border bg-card px-5 py-3 font-heading text-xl font-bold uppercase tracking-[0.26em] text-foreground sm:text-2xl">
                ENCYPHERIST 2K26-27 · {ORG.collegeShort}
              </div>

              <h1 className="mt-8 max-w-2xl text-balance font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                BECAUSE GEEKS
                <br />
                ARE{" "}
                <span className="relative inline-block text-primary">
                  CODE BLOODED<span className="text-primary">_</span>
                </span>
              </h1>
              <span className="mt-5 block h-1 w-24 bg-signal" />

              <p className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground">
                Encypherist is the Computer Science &amp; Engineering student forum at{" "}
                {ORG.college}, {ORG.city}. A place where geeks get together — to build,
                ship, compete and occasionally give back.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button
                  size="lg"
                  className="font-mono text-sm"
                  nativeButton={false}
                  render={<Link href="/members" />}
                >
                  Meet the team
                  <ArrowUpRight className="size-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-center border-t border-border p-6 sm:p-10 lg:border-t-0">
              <LogoMark className="h-full w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Manifesto */}
      <section id="about" className="border-b border-border">
        <Reveal className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <span className="block h-0.5 w-16 bg-signal" />
          <h2 className="mt-6 max-w-3xl text-balance font-heading text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            WE DON&apos;T ONLY
            <br />
            <span className="text-primary">STUDY THE SYSTEM.</span>
          </h2>
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <p className="text-base leading-relaxed text-muted-foreground">
              Encypherist runs under the Department of Computer Science &amp;
              Engineering at {ORG.college} — an autonomous, NAAC A+ accredited
              institute affiliated to RTM Nagpur University. We&apos;re a forum, not a
              faculty — the whole thing is planned and run by students.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Each tenure is led by a student council spanning final, third and
              second year — technical, documentation, creative, strategic and
              publicity layers all reporting into one system. The council changes
              every year. The build log doesn&apos;t reset.
            </p>
          </div>
        </Reveal>
      </section>

      {/* -------------------------------------------------------------- Faculty Board */}
      {facultyMembers.length > 0 && (
        <section className="border-b border-border bg-card/30">
          <Reveal className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <div className="mx-auto w-fit rounded-xl border-2 border-border bg-background px-6 py-3 font-heading text-xl font-bold uppercase tracking-[0.26em] text-foreground">
                FACULTY CORE BOARD
              </div>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              {facultyMembers.slice(0, 3).map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* -------------------------------------------------------------- Core team */}
      {coreTeam.length > 0 && (
        <section className="border-b border-border">
          <Reveal className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading title="The people behind the system." />
              <Link
                href="/members"
                className="inline-flex items-center gap-1 font-mono text-xs text-primary"
              >
                All members
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {coreTeam.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* ----------------------------------------------------------------- Gallery */}
      {galleryPreview.length > 0 && (
        <section className="border-b border-border">
          <Reveal className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow="// GALLERY" title="Moments, logged and captioned." />
              <Link
                href="/gallery"
                className="inline-flex items-center gap-1 font-mono text-xs text-primary"
              >
                Full gallery
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
            <div className="mt-12 columns-2 gap-4 sm:columns-3">
              {galleryPreview.map((item) => (
                <div
                  key={item.id}
                  className="mb-4 aspect-square break-inside-avoid overflow-hidden border border-border"
                >
                  <PosterPlaceholder title={item.caption ?? item.event_title} />
                </div>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* ------------------------------------------------------- Core principles */}
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
                <div key={p.number} className="group relative bg-background p-6">
                  <p className="font-mono text-xs text-primary">{p.number}</p>
                  <h3 className="mt-3 font-heading text-xl font-semibold text-foreground">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {p.description}
                  </p>
                  <div className="mt-4 max-h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-16 group-hover:opacity-100">
                    <div className="border-t border-border pt-3 font-mono text-[10px] uppercase tracking-wider text-primary">
                      {p.tag}
                      <br />
                      <span className="text-muted-foreground/70">{p.detail}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      
    </>
  );
}
