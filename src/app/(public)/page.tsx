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
import { ProjectCard } from "@/components/projects/project-card";
import { ConfidenceBadge } from "@/components/site/confidence-badge";
import { getPublishedEvents, splitUpcomingPast } from "@/lib/data/events";
import { getPublishedMembers } from "@/lib/data/members";
import { getPublishedProjects } from "@/lib/data/projects";
import { getGallery } from "@/lib/data/gallery";
import { getSiteSettings, getSocialLinks } from "@/lib/data/settings";
import { formatDateRange, eventNumber } from "@/lib/format";
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
  const [events, members, projects, gallery, settings, socialLinks] = await Promise.all([
    getPublishedEvents().catch(() => []),
    getPublishedMembers().catch(() => []),
    getPublishedProjects().catch(() => []),
    getGallery().catch(() => []),
    getSiteSettings().catch(() => null),
    getSocialLinks().catch(() => []),
  ]);

  const { upcoming, past, announced } = splitUpcomingPast(events);
  const featured = upcoming[0] ?? announced[0] ?? null;
  const featuredIndex = featured ? events.findIndex((e) => e.id === featured.id) : -1;
  const currentTenureMemberCount = members.filter((m) => m.team_group !== "history").length;
  const recentPast = past.slice(0, 3);
  const coreTeam = members.filter((m) => m.is_core && m.team_group !== "history").slice(0, 8);
  const galleryPreview = gallery.slice(0, 6);
  const featuredProjects = projects.slice(0, 2);
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
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                <Terminal className="size-3.5 text-primary" />
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
                <Button
                  size="lg"
                  variant="outline"
                  className="font-mono text-sm"
                  nativeButton={false}
                  render={<Link href="/projects" />}
                >
                  See projects
                </Button>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-8 border-t border-border p-6 sm:p-10 lg:border-t-0">
              <div className="flex flex-1 items-center justify-center border border-dashed border-border p-0">
                <LogoMark className="h-full w-full" />
              </div>
              <SystemStatusCard
                lines={[
                  `MEMBER_NODES: ${currentTenureMemberCount}`,
                  `BUILD_LOG: ${verifiedActivityCount || 11}_ENTRIES`,
                  "MENTORSHIP_LAYER: ON",
                  "STATUS: STABLE",
                ]}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-6 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70 sm:px-10">
            <span>ENCYPHERIST_SYSTEM // CSE_FORUM</span>
            <span>SCROLL TO CONTINUE ↓</span>
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

      {/* ------------------------------------------------------- Core principles */}
      <section className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="// CORE_PRINCIPLES" title="How the system runs." />
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

      {/* --------------------------------------------------------- Featured event */}
      {featured && (
        <section className="border-b border-border">
          <Reveal className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="relative aspect-[4/3] overflow-hidden border border-border">
                <PosterPlaceholder title={featured.title} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-primary">
                    {`// ${eventNumber(featuredIndex >= 0 ? featuredIndex : 0)}`}
                  </span>
                  <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    STATUS:{" "}
                    {upcoming[0]
                      ? "REGISTRATION_" + (featured.registration_enabled ? "OPEN" : "PENDING")
                      : "ANNOUNCED"}
                  </span>
                  <ConfidenceBadge confidence={featured.confidence} />
                </div>
                <h2 className="mt-3 text-balance font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-2 font-mono text-sm text-muted-foreground">
                  DATE // {formatDateRange(featured.start_at, featured.end_at)}
                </p>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
                  {featured.summary}
                </p>
                <Button
                  className="mt-8 font-mono text-sm"
                  nativeButton={false}
                  render={<Link href={`/events/${featured.slug}`} />}
                >
                  View details
                  <ArrowUpRight className="size-4" />
                </Button>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* -------------------------------------------------------------- Projects */}
      <section className="border-b border-border bg-card/30">
        <Reveal className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="// BUILD_LOG" title="What we've shipped." />
            <Link
              href="/projects"
              className="inline-flex items-center gap-1 font-mono text-xs text-primary"
            >
              All projects
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          {featuredProjects.length > 0 ? (
            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {featuredProjects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </div>
          ) : (
            <div className="mt-12 max-w-lg border border-dashed border-border p-8">
              <p className="font-mono text-xs uppercase tracking-wider text-signal">
                STATUS: PIPELINE_EMPTY
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                No public projects verified yet — nothing invented here. Real builds
                land on this page the moment the forum ships one.
              </p>
            </div>
          )}
        </Reveal>
      </section>

      {/* -------------------------------------------------------------- Core team */}
      {coreTeam.length > 0 && (
        <section className="border-b border-border">
          <Reveal className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow="// MEMBER_NODES" title="The people behind the system." />
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

      {/* ------------------------------------------------------------ Past events */}
      {recentPast.length > 0 && (
        <section className="border-b border-border bg-card/30">
          <Reveal className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow="// ARCHIVE" title="Recently, on Encypherist." />
              <Link
                href="/events"
                className="inline-flex items-center gap-1 font-mono text-xs text-primary"
              >
                All events
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recentPast.map((event) => (
                <EventCard key={event.id} event={event} />
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

      {/* ------------------------------------------------------------- Community */}
      <section>
        <Reveal className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div id="contact" className="corner-brackets flex scroll-mt-20 flex-col items-center gap-6 border border-border bg-card px-6 py-16 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              {"// SYSTEM_ACCESS: EXTERNAL_COMMUNICATION"}
            </p>
            <h2 className="max-w-2xl text-balance font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Follow along, or show up to the next one.
            </h2>
            <p className="max-w-lg text-balance text-muted-foreground">
              Announcements, highlights and event drops go up on Instagram first.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
              {instagram && (
                <Button
                  size="lg"
                  className="font-mono text-sm"
                  nativeButton={false}
                  render={<a href={instagram.url} target="_blank" rel="noopener noreferrer" />}
                >
                  <AtSign className="size-4" />
                  @encypherist_
                </Button>
              )}
              {settings?.contact_email && (
                <Button
                  size="lg"
                  variant="outline"
                  className="font-mono text-sm"
                  nativeButton={false}
                  render={<a href={`mailto:${settings.contact_email}`} />}
                >
                  <Mail className="size-4" />
                  Get in touch
                </Button>
              )}
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
